import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { itemAPI, locationAPI, backupAPI } from '../api';

export const useItemStore = defineStore('item', () => {
  const items = ref([]);
  const categories = ref([]);
  const tags = ref([]);
  const locations = ref([]);
  const statuses = ref([]);
  const loading = ref(false);
  const total = ref(0);
  const currentPage = ref(1);
  const filters = ref({
    search: '',
    category: '',
    tags: '',
    status: '',
    location: ''
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
    
    if (filters.value.status) {
      result = result.filter(item => item.status === filters.value.status);
    }
    
    if (filters.value.location) {
      result = result.filter(item => item.location === filters.value.location);
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

  // 获取状态列表
  const fetchStatuses = async () => {
    try {
      const response = await itemAPI.getStatuses();
      statuses.value = response.data;
    } catch (error) {
      throw error;
    }
  };

  // 获取存放位置列表
  const fetchLocations = async () => {
    try {
      const response = await locationAPI.getAll();
      locations.value = response.data;
    } catch (error) {
      throw error;
    }
  };

  // 创建存放位置
  const createLocation = async (data) => {
    try {
      const response = await locationAPI.create(data);
      locations.value.push(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // 更新存放位置
  const updateLocation = async (id, data) => {
    try {
      const response = await locationAPI.update(id, data);
      const index = locations.value.findIndex(loc => loc.id === id);
      if (index > -1) {
        locations.value[index] = response.data;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // 删除存放位置
  const deleteLocation = async (id) => {
    try {
      await locationAPI.delete(id);
      locations.value = locations.value.filter(loc => loc.id !== id);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const importData = async (data, overwrite = false) => {
    loading.value = true;
    try {
      const response = await backupAPI.import(data, overwrite);
      // 刷新数据
      await fetchItems();
      await fetchCategories();
      await fetchTags();
      await fetchLocations();
      return response;
    } finally {
      loading.value = false;
    }
  };

  const deleteAll = async () => {
    loading.value = true;
    try {
      // 清空所有物品
      for (const item of items.value) {
        await itemAPI.delete(item.id);
      }
      items.value = [];
      total.value = 0;
      return true;
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    categories,
    tags,
    locations,
    statuses,
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
    fetchTags,
    fetchStatuses,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    importData,
    deleteAll
  };
});
