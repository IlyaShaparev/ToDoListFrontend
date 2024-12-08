<template>
  <form class="loginForm" @submit.prevent="handleSubmit">
    <label for="username" v-if="isLoginNeed">
      Имя
      <input type="text" name="username" id="username" placeholder="Введите Ваше имя" v-model="formData.name">
    </label>
    <label for="login">
      Логин
      <input type="text" name="login" id="login" placeholder="Логин будет использоваться при авторизации" v-model="formData.login">
    </label>
    <label for="password">
      Пароль
      <input type="password" name="password" id="password" v-model="formData.password">
    </label>
    <label for="">
      Впервые у нас?
      <input type="checkbox" name="isLoginNeed" @click="handleLoginNeed">
    </label>
    <button type="submit">{{isLoginNeed ? 'Зарегестрироваться' : 'Войти'}}</button>
  </form>
</template>

<script setup>
import { useStore } from 'vuex';
import axios from 'axios';
import { AUTH_HEADERS } from "../constants/index.js";
import { computed, ref } from 'vue';
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();
const user = computed(() => store.state.user);

const setUser = (token, user) => store.dispatch('setUser', {token, user});
const clearUser = () => store.dispatch('clearUser');

//TODO: На всю formData можно поступить аналогично запросам см. коммент ниже
const formData = ref({
  name: '',
  login: '',
  password: ''
});
const isLoginNeed = ref(false);

//TODO: Можно завести простенькие функции на эти запросы, ибо они неизменны (сюда ссылается коммент стирать осторожно!)
//TODO: Надо рефакторить, чет жопа какая-то, как вариант вынести все в стейт, но так регистрация не пришей козе баян
const handleSubmit = () => {
  if(isLoginNeed.value) {
    axios.post('api/auth/login', formData.value,  {
      headers: AUTH_HEADERS

    }).then(response => {

      if(response.status === 200) {

        axios.post('api/auth/auth', formData.value, {
          headers: AUTH_HEADERS

        }).then(response => {
          console.log(response)
          if (response.status === 200) {
            setUser(response.data?.token, response.data?.user);
            router.push('/tasks');
          }
        }).catch(error => {
          alert(error.response.data.message);
        })
      }
    }).catch(error => {
      alert(error.response.data.message);
    });
  } else {
    axios.post('api/auth/auth', formData.value, {
      headers: AUTH_HEADERS

    }).then(response => {
      console.log(response)
      if (response.status === 200) {
        setUser(response.data?.token, response.data?.user);
        router.push('/tasks');
      }

    }).catch(error => {
      alert(error.response.data.message);
    })
  }
}

const handleLoginNeed = () => {
  isLoginNeed.value = !isLoginNeed.value;
}
</script>

<style scoped>

</style>