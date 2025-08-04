"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "../services/api";
import { Loader2, X, Upload } from "lucide-react";

const ProductDialog = ({
	open,
	onOpenChange,
	product,
	onSuccess,
}) => {
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [formData, setFormData] = useState({
		titleUz: "",
		titleRu: "",
		descriptionUz: "",
		descriptionRu: "",
		category: "bathrobe",
		price: "",
		stockQuantity: "",
		sizes: "",
		colors: "",
	});

	const categories = [
		{ value: "bathrobe", label: "Xalat" },
		{ value: "towel", label: "Sochiq" },
		{ value: "set", label: "To'plam" },
		{ value: "accessories", label: "Aksessuarlar" },
	];

	useEffect(() => {
		if (product) {
			setFormData({
				titleUz: product.titleUz || "",
				titleRu: product.titleRu || "",
				descriptionUz: product.descriptionUz || "",
				descriptionRu: product.descriptionRu || "",
				category: product.category || "bathrobe",
				price: product.price?.toString() || "",
				stockQuantity:
					product.stockQuantity?.toString() || "",
				sizes: product.sizes?.join(", ") || "",
				colors: product.colors?.join(", ") || "",
			});
		} else {
			setFormData({
				titleUz: "",
				titleRU: "",
				descriptionUz: "",
				descriptionRu: "",
				category: "bathrobe",
				price: "",
				stockQuantity: "",
				sizes: "",
				colors: "",
			});
		}
		setSelectedFiles([]);
	}, [product, open]);

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		setSelectedFiles(files);
	};

	const removeFile = (index) => {
		setSelectedFiles((prev) =>
			prev.filter((_, i) => i !== index)
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const submitData = new FormData();

			// Add form fields
			Object.keys(formData).forEach((key) => {
				if (key === "sizes" || key === "colors") {
					// Convert comma-separated strings to arrays
					const array = formData[key]
						.split(",")
						.map((item) => item.trim())
						.filter((item) => item);
					submitData.append(key, JSON.stringify(array));
				} else {
					submitData.append(key, formData[key]);
				}
			});

			// Add files
			selectedFiles.forEach((file) => {
				submitData.append("images", file);
			});

			if (product) {
				await apiService.updateProduct(
					product._id,
					submitData
				);
				toast({
					title: "Muvaffaqiyat",
					description: "Mahsulot muvaffaqiyatli yangilandi",
				});
			} else {
				await apiService.createProduct(submitData);
				toast({
					title: "Muvaffaqiyat",
					description: "Mahsulot muvaffaqiyatli yaratildi",
				});
			}

			onSuccess();
		} catch (error) {
			toast({
				title: "Xatolik",
				description:
					error.response?.data?.message ||
					"Mahsulotni saqlashda xatolik",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{product
							? "Mahsulotni tahrirlash"
							: "Yangi mahsulot qo'shish"}
					</DialogTitle>
					<DialogDescription>
						Mahsulot ma'lumotlarini kiriting. Barcha
						majburiy maydonlarni to'ldiring.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="title">
									Mahsulot nomi uz *
								</Label>
								<Input
									id="title"
									value={formData.titleUz}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											titleUz: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="title">
									Mahsulot nomi ru *
								</Label>
								<Input
									id="title"
									value={formData.titleRu}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											titleRu: e.target.value,
										}))
									}
									required
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">
								Tavsif uz *
							</Label>
							<Textarea
								id="description"
								value={formData.descriptionUz}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										descriptionUz: e.target.value,
									}))
								}
								rows={3}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">
								Tavsif ru *
							</Label>
							<Textarea
								id="description"
								value={formData.descriptionRu}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										descriptionRu: e.target.value,
									}))
								}
								rows={3}
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="category">
									Kategoriya *
								</Label>
								<select
									id="category"
									value={formData.category}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											category: e.target.value,
										}))
									}
									className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								>
									{categories.map((cat) => (
										<option
											key={cat.value}
											value={cat.value}
										>
											{cat.label}
										</option>
									))}
								</select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="price">
									Narx ($) *
								</Label>
								<Input
									id="price"
									type="number"
									step="0.01"
									min="0"
									value={formData.price}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											price: e.target.value,
										}))
									}
									required
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="stockQuantity">
								Sklad miqdori
							</Label>
							<Input
								id="stockQuantity"
								type="number"
								min="0"
								value={formData.stockQuantity}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										stockQuantity: e.target.value,
									}))
								}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="sizes">
									O'lchamlar (vergul bilan ajrating)
								</Label>
								<Input
									id="sizes"
									placeholder="S, M, L, XL"
									value={formData.sizes}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											sizes: e.target.value,
										}))
									}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="colors">
									Ranglar (vergul bilan ajrating)
								</Label>
								<Input
									id="colors"
									placeholder="Oq, Qora, Ko'k"
									value={formData.colors}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											colors: e.target.value,
										}))
									}
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="images">Rasmlar</Label>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
								<input
									id="images"
									type="file"
									multiple
									accept="image/*"
									onChange={handleFileChange}
									className="hidden"
								/>
								<label
									htmlFor="images"
									className="flex flex-col items-center justify-center cursor-pointer"
								>
									<Upload className="h-8 w-8 text-gray-400 mb-2" />
									<span className="text-sm text-gray-600">
										Rasmlarni tanlash uchun bosing
									</span>
									<span className="text-xs text-gray-400 mt-1">
										PNG, JPG, GIF (maksimal 5MB)
									</span>
								</label>
							</div>

							{selectedFiles.length > 0 && (
								<div className="space-y-2">
									<Label>Tanlangan rasmlar:</Label>
									<div className="space-y-1">
										{selectedFiles.map(
											(file, index) => (
												<div
													key={index}
													className="flex items-center justify-between bg-gray-50 p-2 rounded"
												>
													<span className="text-sm truncate">
														{file.name}
													</span>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() =>
															removeFile(
																index
															)
														}
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
											)
										)}
									</div>
								</div>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Bekor qilish
						</Button>
						<Button type="submit" disabled={loading}>
							{loading && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{product ? "Yangilash" : "Yaratish"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ProductDialog;
