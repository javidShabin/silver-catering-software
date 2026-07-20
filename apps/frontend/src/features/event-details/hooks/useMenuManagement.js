import { useState, useCallback, useMemo } from "react";
import { menuApi } from "../../../api/menuApi";
import { eventApi } from "../../../api/eventApi";
import { packagesApi } from "../../../api/packagesApi";

export const useMenuManagement = (event, setEvent, eventId, setToast) => {
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuModalTab, setMenuModalTab] = useState("add"); // "add" | "selected"
  const [allMenus, setAllMenus] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Custom Dish creation fields
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customCategory, setCustomCategory] = useState("Main Course");
  const [customDescription, setCustomDescription] = useState("");

  const openMenuModal = useCallback(async () => {
    setSelectedMenus(event?.menuItems || []);
    let initialSelections = event?.customMenuSelections || {};
    if (typeof initialSelections === 'string') {
      try { initialSelections = JSON.parse(initialSelections); } catch(e) { initialSelections = {}; }
    }
    setCustomSelections(initialSelections);
    setMenuModalTab("add");
    setIsMenuModalOpen(true);
    try {
      const [res, pkgRes] = await Promise.all([
        menuApi.getAll({ limit: 100 }),
        packagesApi.getAll().catch(() => ({ status: 'error', data: [] }))
      ]);
      setAllMenus(res.data || []);
      if (pkgRes.status === "success") setPackages(pkgRes.data || []);
    } catch (err) {
      console.error("Failed to load menus:", err);
      setToast({ message: "Failed to load menus from backend.", type: "error" });
    }
  }, [event?.menuItems, event?.customMenuSelections, setToast]);

  const [customSelections, setCustomSelections] = useState(() => {
    let initial = event?.customMenuSelections || {};
    if (typeof initial === 'string') {
      try { initial = JSON.parse(initial); } catch(e) { initial = {}; }
    }
    return initial;
  });

  const handleToggleMenu = useCallback((menuItem) => {
    setSelectedMenus((prev) => {
      const exists = prev.some((m) => m.id === menuItem.id);
      if (exists) {
        return prev.filter((m) => m.id !== menuItem.id);
      } else {
        return [...prev, menuItem];
      }
    });

    setCustomSelections((curr) => {
      const exists = !!curr[menuItem.id];
      if (exists) {
        const newSelections = { ...curr };
        delete newSelections[menuItem.id];
        return newSelections;
      } else {
        return {
          ...curr,
          [menuItem.id]: { type: "PER_UNIT", price: menuItem.minPrice, quantity: 1, unit: "plate" }
        };
      }
    });
  }, []);

  const handleApplyPackage = useCallback((pkgId) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;
    
    setSelectedMenus(prev => {
      const currentMenuIds = new Set(prev.map(m => m.id));
      const newMenus = [...prev];
      pkg.menuItems.forEach(item => {
        if (!currentMenuIds.has(item.id)) {
          newMenus.push(item);
        }
      });
      return newMenus;
    });

    setCustomSelections(curr => {
      const newSelections = { ...curr };
      // Assume selectedMenus will eventually have the items, we just need to populate selections
      pkg.menuItems.forEach(item => {
        if (!newSelections[item.id]) {
          newSelections[item.id] = { type: "PER_UNIT", price: item.minPrice, quantity: 1, unit: "plate" };
        }
      });
      return newSelections;
    });
    setToast({ message: `Applied package: ${pkg.name}`, type: "success" });
  }, [packages, setToast]);

  const handleAddCustomDish = useCallback(async (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      setToast({ message: "Dish name is required", type: "error" });
      return;
    }

    try {
      const defaultDesc = customDescription.trim() || `Premium custom dish specifically created for event: ${event?.title || 'Unknown'}`;
      const dishPrice = Number(customPrice) || 0;
      const res = await menuApi.create({
        name: customName.trim(),
        description: defaultDesc,
        category: customCategory,
        minPrice: dishPrice,
        maxPrice: dishPrice,
        isAvailable: true
      });

      const newDish = res.data;
      setSelectedMenus((prev) => [...prev, newDish]);
      setAllMenus((prev) => [newDish, ...prev]);
      setCustomSelections((prev) => ({
        ...prev,
        [newDish.id]: {
          type: "PER_UNIT",
          price: dishPrice,
          quantity: 1,
          unit: "plate"
        }
      }));

      setCustomName("");
      setCustomPrice("");
      setCustomDescription("");
      setToast({ message: `"${newDish.name}" created and added to selections!`, type: "success" });
    } catch (err) {
      console.error("Failed to create custom menu item:", err);
      const errMsg = err.response?.data?.message || "Failed to create custom dish. Make sure name is unique.";
      setToast({ message: errMsg, type: "error" });
    }
  }, [customName, customPrice, customDescription, customCategory, event?.title, setToast]);

  const handleSaveMenuChoices = useCallback(async () => {
    if (!event) return;
    try {
      setIsSaving(true);
      const menuIds = selectedMenus.map((m) => m.id);
      
      const selectionsToSave = {};
      Object.keys(customSelections).forEach(key => {
        const sel = customSelections[key];
        const menuItem = selectedMenus.find(m => m.id === key);
        const fallbackPrice = menuItem ? Number(menuItem.minPrice) : 0;
        
        let priceVal;
        if (sel.price === undefined || sel.price === null || sel.price === "") {
          priceVal = fallbackPrice;
        } else {
          const parsed = Number(sel.price);
          priceVal = isNaN(parsed) ? fallbackPrice : parsed;
        }

        selectionsToSave[key] = {
          type: sel.type || "PER_UNIT",
          price: priceVal,
          quantity: sel.type === "PER_UNIT" ? Number(sel.quantity || 1) : 1,
          unit: sel.unit || "plate"
        };
      });

      const res = await eventApi.update(event.id, { 
        menuItems: menuIds,
        customMenuSelections: selectionsToSave 
      });
      const freshEvent = await eventApi.getById(event.id);
      setEvent(freshEvent.data);

      setToast({ message: "Catering menu items updated successfully!", type: "success" });
      setIsMenuModalOpen(false);
    } catch (err) {
      console.error("Failed to update event menu choices:", err);
      setToast({ message: err.response?.data?.message || "Failed to save menu choices.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [event, selectedMenus, customSelections, eventId, setEvent, setToast]);

  const filteredMenus = useMemo(() => {
    return allMenus.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMenus, searchQuery]);

  return {
    isMenuModalOpen,
    setIsMenuModalOpen,
    menuModalTab,
    setMenuModalTab,
    allMenus,
    packages,
    selectedMenus,
    searchQuery,
    setSearchQuery,
    isSaving,
    customName,
    setCustomName,
    customPrice,
    setCustomPrice,
    customCategory,
    setCustomCategory,
    customDescription,
    setCustomDescription,
    openMenuModal,
    handleToggleMenu,
    handleApplyPackage,
    handleAddCustomDish,
    handleSaveMenuChoices,
    filteredMenus,
    customSelections,
    setCustomSelections
  };
};
