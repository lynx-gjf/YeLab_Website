<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Home from './Home.vue'
import Members from './Members.vue'
import Publications from './Publications.vue'
import ProfYe from './ProfYe.vue'
import Contact from './Contact.vue'

const page = computed(() => {
  const path = window.location.pathname
  if (path.endsWith('/members.html') || path.endsWith('/members')) return Members
  if (path.endsWith('/publications.html') || path.endsWith('/publications')) return Publications
  if (path.endsWith('/prof-ye.html') || path.endsWith('/prof-ye')) return ProfYe
  if (path.endsWith('/contact.html') || path.endsWith('/contact')) return Contact
  return Home
})

onMounted(() => {
  const titles: Record<string, string> = {
    Home: 'The Ye Group — Glycochemistry & Glycopharmaceutical Research',
    Members: 'Members — The Ye Group',
    Publications: 'Publications — The Ye Group',
    ProfYe: 'Prof. Ye — The Ye Group',
    Contact: 'Contact — The Ye Group',
  }
  document.title = titles[page.value.name ?? 'Home'] ?? titles.Home
})
</script>

<template>
  <component :is="page" />
</template>
