import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { categoryModuleSchema } from "../data/module.schema";
import { getCategoryDetails, saveCategory, getCategoryParentBySlug } from "../data/categories.service";
import {
  getCategoryIdentifier,
  normalizeCategoryData,
  normalizeCategorySavePayload,
  slugifyCategory,
} from "../utils/category.utils";

export const useCategoryForm = ({ isOpen, onClose, selectedCategory, onAfterSave, parentSlug = "", initialName = "" }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingCategory, setFetchingCategory] = useState(false);
  const [formData, setFormData] = useState(categoryModuleSchema.form.initialValues);
  const [errors, setErrors] = useState({});

  const mode = selectedCategory ? "edit" : "create";
  const categoryId = getCategoryIdentifier(selectedCategory);

  useEffect(() => {
    let active = true;
    if (isOpen && !selectedCategory && parentSlug) {
      setErrors({});
      setFetchingCategory(true);
      setFormData({ ...categoryModuleSchema.form.initialValues, categoryName: initialName, slug: parentSlug, is_parent: "no", __lockedParent: true });
      getCategoryParentBySlug(parentSlug).then((res) => {
        const parent = res?.data?.[0];
        if (!parent?.category_id) throw new Error("Parent category not found");
        if (active) setFormData((current) => ({ ...current, parent_id: parent.category_id }));
      }).catch((error) => { if (active) toast.error(error.message || "Unable to load parent category"); })
        .finally(() => { if (active) setFetchingCategory(false); });
      return () => { active = false; };
    }
    const fetchCategoryDetails = async () => {
      if (!isOpen || !categoryId) return;

      try {
        setFetchingCategory(true);
        const res = await getCategoryDetails(categoryId);
        setFormData(normalizeCategoryData(res?.data || selectedCategory));
      } catch (error) {
        toast.error("Unable to fetch category details");
        setFormData(normalizeCategoryData(selectedCategory));
      } finally {
        setFetchingCategory(false);
      }
    };

    if (selectedCategory && isOpen) {
      fetchCategoryDetails();
      return;
    }

    setFormData(categoryModuleSchema.form.initialValues);
    setErrors({});
  }, [selectedCategory, isOpen, categoryId, parentSlug, initialName]);

  const handleClose = () => {
    setFormData(categoryModuleSchema.form.initialValues);
    setErrors({});
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (parentSlug && ["slug", "is_parent", "parent_id"].includes(name)) return;

    setFormData((current) => {
      const nextState = {
        ...current,
        [name]: value,
      };

      if (name === "categoryName" && !parentSlug) {
        const currentSlug = String(current.slug || "");
        const nextSlug = slugifyCategory(value);
        const previousGeneratedSlug = slugifyCategory(current.categoryName || "");

        if (!currentSlug || currentSlug === previousGeneratedSlug) {
          nextState.slug = nextSlug;
        }
      }

      if (name === "is_parent" && value === "yes") {
        nextState.parent_id = null;
      }

      return nextState;
    });
  };

  const handleSave = async () => {
    const { __lockedParent, ...values } = formData;
    const payload = normalizeCategorySavePayload(parentSlug ? { ...values, slug: parentSlug, is_parent: "no" } : values);
    const result = categoryModuleSchema.validationSchema.safeParse(payload);

    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    try {
      setErrors({});
      setLoading(true);
      const res = await saveCategory({ mode, categoryId, payload });

      if (res.success) {
        toast.success(res?.message || `Category ${mode === "create" ? "created" : "updated"} successfully`);
        setFormData(categoryModuleSchema.form.initialValues);
        onClose();
        onAfterSave?.({ ...payload, category_id: res?.data?.insertId || categoryId });
        return;
      }

      toast.error(res?.msg || res?.message || "Something went wrong");
    } catch (error) {
      toast.error(error.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchingCategory,
    formData,
    errors,
    handleClose,
    handleChange,
    handleSave,
  };
};
