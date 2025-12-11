// components/UserTable.js
"use client";
import React from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

export default function UserTable({
  users,
  loading,
  API_URL,
  currentUser,
  handleEdit,
  handleDelete,
  loadingDelete,
  userToDelete,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sidebar-primary"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'doctor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'public': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Utilisateur</th>
            <th className="text-left p-4 font-semibold text-foreground">Rôle</th>
            <th className="text-left p-4 font-semibold text-foreground">Statut</th>
            <th className="text-right p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {/* عرض صورة الملف الشخصي بدلاً من الحرف الأول */}
                  {user.profile?.url ? (
                    <img 
                      src={`${API_URL}${user.profile.url}`}
                      alt={user.username}
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-auto rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-medium">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{user.username}</span>
                    <span className="text-sm text-muted-foreground">
                      Create Date : {new Date(user.createdAt).toLocaleDateString()} 
                      </span></div>
                </div>
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role?.name)}`}>
                  {user.role?.name || 'Aucun rôle'}
                </span>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                    {user.isActive ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    disabled={loadingDelete}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={loadingDelete || (currentUser && user.id === currentUser.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                    title="Supprimer"
                  >
                    {loadingDelete && userToDelete === user.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}