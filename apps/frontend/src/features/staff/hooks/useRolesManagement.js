import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "../../../api/staffApi";
import { toast } from 'react-hot-toast';

export const useRolesManagement = () => {
  const queryClient = useQueryClient();
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: "", label: "", description: "", permissions: [] });

  const setToast = (data) => { if (!data) return; if (data.type === 'error') toast.error(data.message); else toast.success(data.message); };

  const { data: rolesData, isLoading: isFetchingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => staffApi.getRoles(),
  });

  const roles = rolesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (formData) => staffApi.createRole(formData),
    onSuccess: () => {
      setToast({ message: "Role created successfully", type: "success" });
      setRoleForm({ name: "", label: "", description: "", permissions: [] });
      setIsAddingRole(false);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err) => setToast({ message: err.response?.data?.message || "Failed to create role", type: "error" })
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => staffApi.updateRole(editingRole.id, formData),
    onSuccess: () => {
      setToast({ message: "Role updated successfully", type: "success" });
      setRoleForm({ name: "", label: "", description: "", permissions: [] });
      setEditingRole(null);
      setIsAddingRole(false);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err) => setToast({ message: err.response?.data?.message || "Failed to update role", type: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId) => staffApi.deleteRole(roleId),
    onSuccess: () => {
      setToast({ message: "Role deleted successfully", type: "success" });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err) => setToast({ message: err.response?.data?.message || "Failed to delete role", type: "error" })
  });

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (editingRole) {
      updateMutation.mutate({
        label: roleForm.label,
        description: roleForm.description,
        permissions: roleForm.permissions
      });
    } else {
      createMutation.mutate(roleForm);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this custom role? Any staff under this role will retain their string role but access should be updated.")) return;
    deleteMutation.mutate(roleId);
  };

  return {
    isRolesModalOpen, setIsRolesModalOpen,
    roles,
    isAddingRole, setIsAddingRole,
    editingRole, setEditingRole,
    roleForm, setRoleForm,
    isLoadingRoles: isFetchingRoles || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    handleSaveRole,
    handleDeleteRole
  };
};
