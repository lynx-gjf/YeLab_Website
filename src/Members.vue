<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { fetchJson, mediaUrl } from './api'

interface Member {
  id: number
  name: string
  role: string
  years: string
  group_name: string
  photo_url: string
  gender: string
  birth_info: string
  nationality: string
  address: string
  email: string
  education: string
  biography: string
  publications: string
  sort_order: number
}

const members = ref<Member[]>([])
const activeId = ref<number | null>(null)
const loadError = ref('')

const categories = computed(() => {
  const names = [...new Set(members.value.map(member => member.group_name || 'Group Members'))]
  return names
})
const activeCategory = ref('')
const visibleMembers = computed(() => members.value
  .filter(member => !activeCategory.value || (member.group_name || 'Group Members') === activeCategory.value))
const activeMember = computed(() => members.value.find(member => member.id === activeId.value) || visibleMembers.value[0] || null)

function selectCategory(category: string) {
  activeCategory.value = category
  activeId.value = visibleMembers.value.find(member => (member.group_name || 'Group Members') === category)?.id || null
}

watch(members, () => {
  if (!activeCategory.value && categories.value.length) activeCategory.value = categories.value[0]
  if (!activeId.value && members.value.length) activeId.value = members.value[0].id
})

onMounted(async () => {
  try {
    members.value = await fetchJson<Member[]>('/api/members')
  } catch {
    loadError.value = 'Unable to load members.'
  }
})
</script>

<template>
<header>
  <div class="header-inner">
    <a href="index.html" class="logo">Ye Group<small>Glycochemistry &amp; Glycopharmaceutical Research</small></a>
    <nav id="siteNav"><ul>
      <li><a href="index.html">Home</a></li><li><a href="prof-ye.html">Prof. Ye</a></li>
      <li><a href="index.html#research">Research</a></li><li><a href="members.html">People</a></li>
      <li><a href="publications.html">Publications</a></li><li><a href="news.html">News</a></li><li><a href="contact.html">Contact</a></li>
    </ul></nav>
    <button class="menu-toggle" id="menuToggle" aria-label="Toggle navigation">&#9776;</button>
  </div>
</header>

<main class="people-page">
  <h1 class="people-title">{{ activeCategory || 'People' }}</h1>
  <p v-if="loadError" class="section-lead">{{ loadError }}</p>

  <div v-if="activeMember" class="people-layout">
    <article class="person-profile">
      <div class="person-profile-photo">
        <img v-if="activeMember.photo_url" :src="mediaUrl(activeMember.photo_url)" :alt="activeMember.name">
        <span v-else>+</span>
      </div>
      <div class="person-profile-main">
        <h2>{{ activeMember.name }}</h2>
        <p v-if="activeMember.role" class="person-position">{{ activeMember.role }}</p>
        <p v-if="activeMember.years" class="person-years">{{ activeMember.years }}</p>

        <dl class="person-facts">
          <div v-if="activeMember.gender"><dt>M/F</dt><dd>{{ activeMember.gender }}</dd></div>
          <div v-if="activeMember.birth_info"><dt>Date of birth</dt><dd>{{ activeMember.birth_info }}</dd></div>
          <div v-if="activeMember.nationality"><dt>Nationality</dt><dd>{{ activeMember.nationality }}</dd></div>
          <div v-if="activeMember.address"><dt>Address</dt><dd>{{ activeMember.address }}</dd></div>
          <div v-if="activeMember.email"><dt>Email</dt><dd>{{ activeMember.email }}</dd></div>
        </dl>

        <section v-if="activeMember.education" class="person-detail">
          <h3>Education</h3>
          <p v-for="(line, index) in activeMember.education.split('\n')" :key="index">{{ line }}</p>
        </section>
        <section v-if="activeMember.biography" class="person-detail">
          <h3>Biography</h3>
          <p v-for="(line, index) in activeMember.biography.split('\n')" :key="index">{{ line }}</p>
        </section>
        <section v-if="activeMember.publications" class="person-detail">
          <h3>Publication</h3>
          <p v-for="(line, index) in activeMember.publications.split('\n')" :key="index">{{ line }}</p>
        </section>
      </div>
    </article>

    <aside class="people-sidebar">
      <label class="people-category">
        <select :value="activeCategory" @change="selectCategory(($event.target as HTMLSelectElement).value)">
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
      </label>
      <button
        v-for="member in visibleMembers"
        :key="member.id"
        type="button"
        class="people-list-item"
        :class="{ active: member.id === activeMember.id }"
        @click="activeId = member.id"
      >
        <span class="people-thumb">
          <img v-if="member.photo_url" :src="mediaUrl(member.photo_url)" :alt="member.name">
          <span v-else>+</span>
        </span>
        <span>{{ member.name }}</span>
      </button>
    </aside>
  </div>
</main>

<footer>
  <div class="footer-content">
    <div class="footer-about"><h3>The Ye Group</h3><p>Glycochemistry, glycopharmaceutical chemistry and chemical glycobiology.</p></div>
    <div class="footer-links"><h4>Navigate</h4><ul>
      <li><a href="/">Home</a></li><li><a href="/prof-ye.html">Prof. Ye</a></li>
      <li><a href="/members.html">People</a></li><li><a href="/publications.html">Publications</a></li>
      <li><a href="/news.html">News</a></li><li><a href="/contact.html">Contact</a></li>
    </ul></div>
  </div>
  <div class="footer-bottom"><p>Peking University Health Science Center, 38 Xueyuan Road, Beijing 100191, China</p><p>The Ye Group &copy; 2026 All Rights Reserved</p></div>
</footer>
</template>
