<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchJson, mediaUrl } from './api'

interface NewsItem {
  id: number
  title: string
  summary: string
  content: string
  image_url: string
  link_url: string
  published_at: string | null
}

const newsItems = ref<NewsItem[]>([])
const loadError = ref('')

onMounted(async () => {
  try {
    newsItems.value = await fetchJson<NewsItem[]>('/api/news')
  } catch {
    loadError.value = 'Unable to load news.'
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
      <li><a href="publications.html">Publications</a></li><li><a href="news.html" class="active">News</a></li><li><a href="contact.html">Contact</a></li>
    </ul></nav>
    <button class="menu-toggle" id="menuToggle" aria-label="Toggle navigation">&#9776;</button>
  </div>
</header>

<div class="page-head"><h1>News</h1><p>Latest updates from the Ye Group</p></div>
<section>
  <div class="container">
    <p v-if="loadError" class="section-lead">{{ loadError }}</p>
    <div class="news-grid">
      <article v-for="item in newsItems" :key="item.id" class="news-card">
        <img v-if="item.image_url" :src="mediaUrl(item.image_url)" :alt="item.title">
        <div class="news-card-body">
          <span v-if="item.published_at" class="pub-year">{{ item.published_at.slice(0, 10) }}</span>
          <h2>{{ item.title }}</h2>
          <p v-if="item.summary">{{ item.summary }}</p>
          <p v-else-if="item.content">{{ item.content }}</p>
          <a v-if="item.link_url" :href="item.link_url" target="_blank" rel="noopener" class="btn ghost">Read More</a>
        </div>
      </article>
    </div>
  </div>
</section>
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
