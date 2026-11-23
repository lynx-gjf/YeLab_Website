<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchJson } from './api'

interface Publication {
  id: number
  title: string
  authors: string
  journal: string
  year: number | null
  doi_url: string
  category: string
}

const publications = ref<Publication[]>([])
const search = ref('')
const decade = ref('all')
const loadError = ref('')

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return publications.value.filter((publication) => {
    if (decade.value !== 'all') {
      const start = Number(decade.value)
      if (!publication.year || publication.year < start || publication.year > start + 9) return false
    }
    if (!term) return true
    return [publication.title, publication.authors, publication.journal]
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
})

const groups = computed(() => {
  const result = new Map<number, Publication[]>()
  for (const publication of filtered.value) {
    const year = publication.year || 0
    result.set(year, [...(result.get(year) || []), publication])
  }
  return [...result.entries()].sort((a, b) => b[0] - a[0])
})

onMounted(async () => {
  try {
    publications.value = await fetchJson<Publication[]>('/api/publications')
  } catch {
    loadError.value = 'Unable to load publications.'
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
      <li><a href="publications.html">Publications</a></li><li><a href="news.html">News</a></li><li><a href="contact.html">Contact</a></li>
    </ul></nav>
    <button class="menu-toggle" id="menuToggle" aria-label="Toggle navigation">&#9776;</button>
  </div>
</header>

<div class="page-head">
  <h1>Publications</h1>
  <p>{{ publications.length }} publications, newest first</p>
</div>

<section>
  <div class="container">
    <div class="pub-toolbar reveal">
      <button :class="{ active: decade === 'all' }" @click="decade = 'all'">All</button>
      <button :class="{ active: decade === '2020' }" @click="decade = '2020'">2020s</button>
      <button :class="{ active: decade === '2010' }" @click="decade = '2010'">2010s</button>
      <button :class="{ active: decade === '2000' }" @click="decade = '2000'">2000s</button>
      <button :class="{ active: decade === '1990' }" @click="decade = '1990'">1990s</button>
      <input v-model="search" class="pub-search" type="search" placeholder="Search author, title or journal..." aria-label="Search publications">
    </div>

    <div class="pub-index reveal is-visible">
      <a v-for="[year] in groups" :key="year" :href="`#y${year}`">{{ year || 'N/A' }}</a>
    </div>

    <p v-if="loadError" class="section-lead">{{ loadError }}</p>
    <p class="pub-status">Showing <strong>{{ filtered.length }}</strong> publications.</p>

    <div v-for="[year, items] in groups" :id="`y${year}`" :key="year" class="year-block reveal is-visible">
      <h2>{{ year || 'Unspecified' }} <span><em class="year-count">{{ items.length }}</em> papers</span></h2>
      <ol class="pub-numbered">
        <li v-for="(publication, index) in items" :key="publication.id">
          <span class="pnum">{{ String(filtered.findIndex(item => item.id === publication.id) + 1) }}.</span>
          <span class="ptitle">{{ publication.title }}</span>
          <template v-if="publication.authors"><br><span>{{ publication.authors }}</span></template>
          <template v-if="publication.journal">
            <br><span class="pj">{{ publication.journal }}<template v-if="publication.year">, {{ publication.year }}</template>.</span>
          </template>
          <a v-if="publication.doi_url" class="pdoi" :href="publication.doi_url" target="_blank" rel="noopener">DOI</a>
        </li>
      </ol>
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
