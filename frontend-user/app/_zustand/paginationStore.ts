import { create } from "zustand";

export type State = {
  page: number;
  totalPages: number;
};

export type Actions = {
  incrementPage: () => void;
  decrementPage: () => void;
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  resetPage: () => void;
};

export const usePaginationStore = create<State & Actions>((set) => ({
  page: 1,
  totalPages: 1,
  incrementPage: () => {
    set((state) => {
      if (state.page < state.totalPages) {
        return { page: state.page + 1 };
      }
      return { page: state.page };
    });
  },
  decrementPage: () => {
    set((state) => {
      if (state.page > 1) {
        return { page: state.page - 1 };
      }
      return { page: 1 };
    });
  },
  setPage: (page: number) => {
    set(() => ({ page: Math.max(1, page) }));
  },
  setTotalPages: (total: number) => {
    set(() => ({ totalPages: Math.max(1, total) }));
  },
  resetPage: () => {
    set(() => ({ page: 1 }));
  },
}));
