import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { itemAPI } from '../api';

export const useItemStore = defineStore('item', () => {
  const items = ref([]);
  const categories = ref([]);
  const tags = ref([]);
  const loading = ref(false);
  const total = ref(0);
  const currentPage = ref(1);
  const filters = ref({
    search: '',
    category: '',
    tags: ''
  });

  const filteredItems = computed(() => {
    let result = [...items.value];
    
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters.value.category) {
      result = result.filter(item => item.category === filters.value.category);
    }
    
    if (filters.value.tags) {
      result = result.filter(item => 
        item.tags && item.tags.includes(filters.value.tags)
      );
    }
    
    return result;
  });

  const fetchItems = async (page = 1, params = {}) => {
    loading.value = true;
    try {
      const response = await itemAPI.getAll({ ...params, page });
      items.value = response.data;
      total.value = response.pagination?.total || response.data.length;
      currentPage.value = page;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchItem = async (id) => {
    loading.value = true;
    try {
      const response = await itemAPI.getById(id);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  const createItem = async (data) => {
    loading.value = true;
    try {
      const response = await itemAPI.create(data);
      items.value.unshift(response.data);
      total.value++;
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async (id, data) => {
    loading.value = true;
    try {
      const response = await itemAPI.update(id, data);
      const index = items.value.findIndex(item => item.id === id);
      if (index > -1) {
        items.value[index] = response.data;
      }
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async (id) => {
    loading.value = true;
    try {
      await itemAPI.delete(id);
      items.value = items.value.filter(item => item.id !== id);
      total.value--;
      return true;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await itemAPI.getCategories();
      categories.value = response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchTags = async () => {
    try {
      const response = await itemAPI.getTags();
      tags.value = response.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    items,
    categories,
    tags,
    loading,
    total,
    currentPage,
    filters,
    filteredItems,
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    fetchCategories,
    fetchTags
  };
});
