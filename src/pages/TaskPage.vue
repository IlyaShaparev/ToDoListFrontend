<script setup>
import MainLayout from '../layout/MainLayout.vue'
import TaskTable from '../components/TaskTable.vue'

</script>

<template>
  <MainLayout>
    <h1>Страница задач</h1>
    <TaskTable :is-all-tasks='false'/>
  </MainLayout>
</template>

<style scoped>

</style>