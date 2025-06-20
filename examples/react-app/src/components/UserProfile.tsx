import React, { useState, useEffect, useCallback } from "react";
import { User, ApiResponse } from "../types";
import { fetchUserById } from "../api/userApi";
import { useDebounce } from "../hooks/useDebounce";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface UserProfileProps {
  userId: string;
  onUserUpdate?: (user: User) => void;
  showActions?: boolean;
  className?: string;
}

interface UserProfileState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUserUpdate,
  showActions = true,
  className = "",
}) => {
  const [state, setState] = useState<UserProfileState>({
    user: null,
    loading: true,
    error: null,
    isEditing: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [favoriteUsers, setFavoriteUsers] = useLocalStorage<string[]>(
    "favoriteUsers",
    []
  );

  // Fetch user data
  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ApiResponse<User> = await fetchUserById(userId);

        if (response.success) {
          setState((prev) => ({
            ...prev,
            user: response.data,
            loading: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || "Failed to load user",
            loading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          loading: false,
        }));
      }
    };

    loadUser();
  }, [userId]);

  // Handle user search
  useEffect(() => {
    if (debouncedSearchTerm && state.user) {
      // Simulate search functionality
      const searchMatch =
        state.user.name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        state.user.email
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      if (!searchMatch) {
        setState((prev) => ({ ...prev, error: "No matching user found" }));
      }
    }
  }, [debouncedSearchTerm, state.user]);

  const handleToggleFavorite = useCallback(() => {
    if (!state.user) return;

    const isFavorite = favoriteUsers.includes(state.user.id);

    if (isFavorite) {
      setFavoriteUsers((prev) => prev.filter((id) => id !== state.user!.id));
    } else {
      setFavoriteUsers((prev) => [...prev, state.user!.id]);
    }
  }, [state.user, favoriteUsers, setFavoriteUsers]);

  const handleEditToggle = useCallback(() => {
    setState((prev) => ({ ...prev, isEditing: !prev.isEditing }));
  }, []);

  const handleUserSave = useCallback(
    async (updatedUser: Partial<User>) => {
      if (!state.user) return;

      setState((prev) => ({ ...prev, loading: true }));

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const updated = { ...state.user, ...updatedUser };
        setState((prev) => ({
          ...prev,
          user: updated,
          loading: false,
          isEditing: false,
        }));

        onUserUpdate?.(updated);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: "Failed to update user",
          loading: false,
        }));
      }
    },
    [state.user, onUserUpdate]
  );

  const validateUserData = (user: User): boolean => {
    return !!(user.name && user.email && user.email.includes("@"));
  };

  const formatUserJoinDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Loading state
  if (state.loading) {
    return (
      <div
        className={`user-profile loading ${className}`}
        data-testid="user-profile-loading"
      >
        <div className="spinner" />
        <p>Loading user profile...</p>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div
        className={`user-profile error ${className}`}
        data-testid="user-profile-error"
      >
        <h3>Error</h3>
        <p>{state.error}</p>
        <button
          onClick={() =>
            setState((prev) => ({ ...prev, error: null, loading: true }))
          }
        >
          Retry
        </button>
      </div>
    );
  }

  // No user state
  if (!state.user) {
    return (
      <div
        className={`user-profile empty ${className}`}
        data-testid="user-profile-empty"
      >
        <p>No user data available</p>
      </div>
    );
  }

  const isFavorite = favoriteUsers.includes(state.user.id);
  const isValidUser = validateUserData(state.user);

  return (
    <div className={`user-profile ${className}`} data-testid="user-profile">
      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="user-search-input"
        />
      </div>

      {/* User Info */}
      <div className="user-info">
        <div className="user-avatar">
          <img
            src={state.user.avatar || "/default-avatar.png"}
            alt={`${state.user.name} avatar`}
            data-testid="user-avatar"
          />
        </div>

        <div className="user-details">
          {state.isEditing ? (
            <EditUserForm
              user={state.user}
              onSave={handleUserSave}
              onCancel={handleEditToggle}
            />
          ) : (
            <>
              <h2 data-testid="user-name">{state.user.name}</h2>
              <p data-testid="user-email">{state.user.email}</p>
              <p data-testid="user-role">{state.user.role}</p>
              <p data-testid="user-join-date">
                Joined: {formatUserJoinDate(state.user.createdAt)}
              </p>
              {!isValidUser && (
                <div
                  className="validation-warning"
                  data-testid="validation-warning"
                >
                  ⚠️ User data incomplete
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="user-actions" data-testid="user-actions">
          <button
            onClick={handleToggleFavorite}
            className={`favorite-btn ${isFavorite ? "active" : ""}`}
            data-testid="favorite-button"
          >
            {isFavorite ? "★" : "☆"} Favorite
          </button>

          <button
            onClick={handleEditToggle}
            className="edit-btn"
            data-testid="edit-button"
          >
            {state.isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
      )}
    </div>
  );
};

// EditUserForm component for inline editing
interface EditUserFormProps {
  user: User;
  onSave: (user: Partial<User>) => void;
  onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="edit-user-form">
      <input
        type="text"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        placeholder="Name"
        required
        data-testid="edit-name-input"
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder="Email"
        required
        data-testid="edit-email-input"
      />
      <select
        value={formData.role}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            role: e.target.value as "user" | "admin" | "moderator",
          }))
        }
        data-testid="edit-role-select"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="moderator">Moderator</option>
      </select>
      <div className="form-actions">
        <button type="submit" data-testid="save-button">
          Save
        </button>
        <button type="button" onClick={onCancel} data-testid="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UserProfile;
