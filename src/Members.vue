<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchJson, mediaUrl } from './api'

interface Member {
  id: number
  name: string
  role: string
  years: string
  group_name: string
  photo_url: string
  sort_order: number
}

const members = ref<Member[]>([])
const loadError = ref('')
const groups = computed(() => {
  const result = new Map<string, Member[]>()
  for (const member of members.value) {
    const name = member.group_name || 'Other Members'
    result.set(name, [...(result.get(name) || []), member])
  }
  return [...result.entries()]
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
      <li><a href="index.html#research">Research</a></li><li><a href="members.html">Members</a></li>
      <li><a href="publications.html">Publications</a></li><li><a href="contact.html">Contact</a></li>
    </ul></nav>
    <button class="menu-toggle" id="menuToggle" aria-label="Toggle navigation">&#9776;</button>
  </div>
</header>

<div class="page-head">
  <h1>Group Members</h1>
  <p>The people behind our work in glycochemistry and glycopharmaceutical research</p>
</div>

<section>
  <div class="container">
    <p v-if="loadError" class="section-lead">{{ loadError }}</p>
    <div v-for="[groupName, groupMembers] in groups" :key="groupName" class="member-group reveal is-visible">
      <h2>{{ groupName }}</h2>
      <div class="member-grid">
        <article v-for="member in groupMembers" :key="member.id" class="member-card">
          <div class="member-avatar">
            <img v-if="member.photo_url" :src="mediaUrl(member.photo_url)" :alt="member.name">
            <span v-else>+</span>
          </div>
          <h3>{{ member.name }}</h3>
          <p v-if="member.role" class="role">{{ member.role }}</p>
          <p v-if="member.years" class="years">{{ member.years }}</p>
        </article>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="footer-content">
    <div class="footer-about"><h3>The Ye Group</h3><p>We are dedicated to research in glycochemistry, glycopharmaceutical chemistry and chemical glycobiology.</p></div>
    <div class="footer-links"><h4>Navigate</h4><ul>
      <li><a href="/">Home</a></li><li><a href="/prof-ye.html">Prof. Ye</a></li>
      <li><a href="/members.html">Members</a></li><li><a href="/publications.html">Publications</a></li>
      <li><a href="/contact.html">Contact</a></li>
    </ul></div>
  </div>
  <div class="footer-bottom"><p>Peking University Health Science Center, 38 Xueyuan Road, Beijing 100191, China</p><p>The Ye Group &copy; 2026 All Rights Reserved</p></div>
</footer>
</template>
