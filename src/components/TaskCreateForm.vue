<template>
  <form class="loginForm" @submit.prevent="handleSubmit">
    <label for="title">
      Название
      <input type="text" name="title" id="title" placeholder="Введите Ваше имя" v-model="formData.title">
    </label>
    <label for="description">
      Описание
      <input type="text" name="description" id="description" placeholder="Логин будет использоваться при авторизации" v-model="formData.description">
    </label>
    <label for="priority">
      Приоритет
      <input type="number" name="priority" min="1" max="10" id="priority" v-model="formData.priority">
    </label>
    <button type="submit">Создать</button>
  </form>
</template>

<script setup>
import { useStore } from 'vuex';
import axios from 'axios';
import { computed, ref } from 'vue';
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();

const token = computed(() => store.state.authToken);

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer ' + token.value,
};

const formData = ref({
  title: '',
  description: '',
  priority: '',
});

const handleSubmit = () => {
  axios.post('api/tasks', formData.value,{headers}).then((response) => {
    if(response.status === 200) {
      router.push('/tasks');
    }
  })
}

</script>

<style scoped>

</style>