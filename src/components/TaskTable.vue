<template>
  <router-link v-if="!isAllTasks" to="/allTasks">К списку всех задач</router-link>
  <router-link v-if="isAllTasks" to="/tasks">К списку моих задач</router-link>
  <table>
    <thead>
      <tr>
        <th @click="calculateSort('id')">Номер задачи</th>
        <th @click="calculateSort('is_closed')">Статус</th>
        <th @click="calculateSort('title')">Название</th>
        <th @click="calculateSort('description')">Описание</th>
        <th @click="calculateSort('created_time')">Время создания</th>
        <th @click="calculateSort('priority')">Приоритет</th>
        <th @click="calculateSort('closed_time')">Время завершения</th>
      </tr>
    </thead>
    <tbody v-if="!loading && tasks.length > 0">
      <tr v-for="(task, index) in tasks" :key="index">
        <td>{{ task.id }}</td>
        <td>{{ task.is_closed === 1 ? 'Завершена' : 'В работе'}}</td>
        <td>{{ task.title }}</td>
        <td>{{ task.description }}</td>
        <td>{{ task.created_time }}</td>
        <td>{{ task.priority }}</td>
        <td>{{ task.closed_time }}</td>
        <td>
          <button v-if="!isAllTasks" @click="handleDelete(task.id)">Удалить задачу</button>
          <button v-if="!isAllTasks" @click="handleOpenUpdate(task.id, index)">Изменить задачу</button>
          <button v-if="!isAllTasks" @click="handleClose(task.id, index)">Сменить статус задачи</button>
          <button @click="handleShowComments(task.id)">Показать комментарии</button>
          <button v-if="isAllTasks" @click="handleCreateComment(task.id, index)">Создать комментарий</button>
        </td>
      </tr>
      <tr v-if="!isAllTasks">
        <td colspan="7" align="center">
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, 'status=-1')">Показать с только открытые</button>
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, 'status=1')">Показать с только закрытые</button>
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, 'priority=+5')">Показать только с приоритетом 5 и выше</button>
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, 'priority=-5')">Показать только с приоритетом ниже 5</button>
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, false)">Показать все</button>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="!loading && tasks.length <= 0">
      <tr>
        <td colspan="7" align="center">У вас нет ни одной задачи</td>
      </tr>
      <tr v-if="!isAllTasks">
        <td colspan="7" align="center">
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, 'status=-1')">Показать с только открытые</button>
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, 'status=1')">Показать с только закрытые</button>
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, 'priority=+5')">Показать только с приоритетом 5 и выше</button>
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, 'priority=-5')">Показать только с приоритетом ниже 5</button>
          <button v-if="!isAllTasks" @click="refreshTasks(currentSort, '')">Показать все</button>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="loading">
    <tr>
      <td colspan="7" align="center">Ищем ваши задачки</td>
    </tr>
    </tbody>
  </table>
  <router-link v-if="!isAllTasks" to="/taskCreate">Создать задачу</router-link>
  <button v-if="!isAllTasks" @click="exportData('csv')">Выгрузить в CSV</button>
  <button v-if="!isAllTasks" @click="exportData('xml')">Выгрузить в XML</button>
  <hr>
  <hr>
  <form class="taskUpdateForm" v-if="dialogOpen" @submit.prevent="handleUpdate(updateFormData.index)">
    <label for="title">
      Название
      <input type="text" name="title" id="title" placeholder="Введите Ваше название" v-model="updateFormData.title">
    </label>
    <label for="description">
      Описание
      <input type="text" name="description" id="description" placeholder="Введите Ваше описание" v-model="updateFormData.description">
    </label>
    <label for="priority">
      Приоритет
      <input type="number" name="priority" min="1" max="10" id="priority" v-model="updateFormData.priority">
    </label>
    <button type="submit">Изменить</button>
  </form>
  <hr>
  <hr>
  <ul v-if="commentsOpen && activeTask['comments'].length > 0">
    <li v-for="(comment, index) in activeTask['comments']" :key="index">{{comment.commentText}}</li>
  </ul>
  <ul v-else-if="commentsOpen && activeTask['comments'].length <= 0">
    <li>Нет комментариев</li>
  </ul>
  <hr>
  <hr>
  <form class="taskUpdateForm" v-if="commentsCreateOpen" @submit.prevent="handleCommentCreate">
    <label for="text">
      Текст комментария
      <textarea v-model="commentCreateData.commentText"></textarea>
    </label>
    <button type="submit">Оставить комментарий</button>
  </form>
</template>
<script setup>
  import {computed, ref} from "vue";
  import axios from 'axios';
  import {useStore} from "vuex";

  const props = defineProps({
    isAllTasks: {
      type: Boolean,
      required: true,
    },
  });

  const loading = ref(true);
  const tasks = ref([]);
  const comments = ref([]);
  const store = useStore();
  const token = computed(() => store.state.authToken);
  const dialogOpen = ref(false);
  const activeTask = ref({
    'id': -1,
    'comments': [],
  });
  const commentsOpen = ref(false);
  const commentsCreateOpen = ref(false);
  const currentSort = ref({
    type: '',
    direction: ''
  })
  const currentFilter = ref('')

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token.value,
  };

  const formData = ref({
    'is_closed': 0,
  });

  const updateFormData = ref({
    'index': -1,
    'title': '',
    'description': '',
    'priority': 0,
  })

  const commentCreateData = ref({
    'index': -1,
    'commentText': '',
    'task_id': 0,
  })

  const refreshTasks = (sort = false, filter = false) => {
    if (props.isAllTasks) {
      axios.get('/api/tasks/show',  {headers} ).then((response) => {
        if(response.status === 200) {
          tasks.value = response.data.tasks;
          comments.value = response.data.comments;
          loading.value = false;
        }
      })
    } else {
      let url = '/api/tasks';
      let isFirst = true;

      if(sort || filter) {
        url += '?'
      }

      if(sort) {
        url += 'sort=' + sort.direction + sort.type;
        isFirst = false;
      }

      currentFilter.value = filter;
      if(filter) {
        if(isFirst) {
          url += filter
        } else {
          url += '&' + filter;
        }
      }

      axios.get(url,  {headers}).then((response) => {
        if(response.status === 200) {
          tasks.value = response.data.tasks;
          comments.value = response.data.comments;
          loading.value = false;
        }
      })
    }
  }

  const handleDelete = (index) => {
    axios.delete('/api/tasks/' + index, {headers}).then((response) => {
      if(response.status === 200) {
        alert('Задача удалена');
        refreshTasks();
      }
    })
  }

  const handleOpenUpdate = (taskId, index) => {
    if(index !== updateFormData.value.index) {
      updateFormData.value.index = index;
      updateFormData.value.priority = tasks.value[index].priority;
      updateFormData.value.title = tasks.value[index].title;
      updateFormData.value.description = tasks.value[index].description;
      dialogOpen.value = true;
    } else {
      updateFormData.value.index = -1;
      dialogOpen.value = false;
    }
  }

  const handleShowComments = (taskId) => {
    if(taskId !== activeTask.value.id) {
      activeTask.value.id = taskId;
      activeTask.value.comments = comments.value[taskId];
      commentsOpen.value = true;
    } else {
      activeTask.value.id = -1;
      commentsOpen.value = false;
    }
  }

  const handleCreateComment = (taskId, index) => {
    if(index !== commentCreateData.value.index) {
      commentCreateData.value.index = index;
      commentCreateData.value.task_id = tasks.value[index].id;
      commentsCreateOpen.value = true;
    } else {
      commentCreateData.value.index = -1;
      commentsCreateOpen.value = false;
    }
  }

  const handleUpdate = (index) => {
    const taskId = tasks.value[index].id;
    delete updateFormData.value.index;
    axios.patch('/api/tasks/' + taskId, updateFormData.value , {headers}).then((response) => {
      if(response.status === 200) {
        alert('Задача изменена');
        dialogOpen.value = false
        updateFormData.value = {
          'index': -1,
          'title': '',
          'description': '',
          'priority': 0,
        };
        refreshTasks();
      }
    })
  }

  const handleClose = (taskId, index) => {
    formData.value.is_closed = tasks.value[index].is_closed ?? -1;

    axios.post('/api/tasks/status/' + taskId, formData.value , {headers}).then((response) => {
      if(response.status === 200) {
        console.log(response.data)
        if(+response.data.is_closed === 1) {
          alert('Задача закрыта');
        } else {
          alert('Задача открыта');
        }

        refreshTasks();
      }
    })
  }

  const exportData = async (format) => {
    axios.get('api/export/' + format, {headers}).then(async (response) => {
      if (response.status === 200) {

        // т.к. REST призывает получать и отдавать данные в одном формате разбиваем ответ на blob и генерируем скачивание на фронте
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `data.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    }).catch((error) => {
      alert(error);
    })
  };

  const handleCommentCreate = () => {
    axios.post('api/comments', commentCreateData.value, {headers}).then((response) => {
      if(response.status === 200) {
        alert('Комментарий добавлен');
        commentsCreateOpen.value = false
        commentCreateData.value = {
          'index': -1,
          'commentText': '',
          'task_id': 0,
        };
        refreshTasks();
      }
    })
  }

  const calculateSort = (type) => {
    if(currentSort.value.type === '') {
      currentSort.value.type = type;
      currentSort.value.direction = '-';
    } else if(currentSort.value?.type === type) {
      currentSort.value.type = type;
      currentSort.value.direction = currentSort.value.direction === '-' ? '' : '-';
    } else {
      currentSort.value.type = type;
      currentSort.value.direction = '-';
    }

    refreshTasks(currentSort.value, currentFilter.value);
  }

  refreshTasks();
</script>

<style scoped>

</style>