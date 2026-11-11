<template>
<header>
    <div class="header-inner">
        <a href="/" class="logo">
            Ye Group
            <small>Glycochemistry &amp; Glycopharmaceutical Research</small>
        </a>
        <nav id="siteNav">
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/#about">About</a></li>
                <li><a href="/#research">Research</a></li>
                <li><a href="./members.html">Members</a></li>
                <li><a href="./publications.html">Publications</a></li>       
                <li><a href="/#contact">Contact</a></li>
            </ul>
        </nav>
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle navigation">&#9776;</button>
    </div>
</header>

<!-- ===================== Hero: typewriter headline ===================== -->
<section class="hero" id="home">
    <h1 class="hero-title">
        Welcome to
        <span class="typed"
              id="typedText"
              data-phrases='["The Ye Group"]'
              data-type-speed="110"
              data-delete-speed="55"
              data-hold="2400"></span><span class="caret" aria-hidden="true"></span>
    </h1>
    <p class="hero-sub reveal" data-delay="200">
        Our group focuses on the synthesis of complex oligosaccharides, the development of
        methodologies for carbohydrate synthesis, and chemical glycobiology.
    </p>
    <a href="#research" class="btn reveal" data-delay="400">Learn More</a>
</section>

<!-- ===================== Our Research: highlights carousel ===================== -->
<section class="carousel alt-bg" id="highlights-carousel">
    <h2 class="section-title">Our Research</h2>
    <p class="section-lead">Three levels of our work &mdash; complex oligosaccharide synthesis, automated glycan synthesis, and synthetic methodology</p>

    <div class="container">
        <div class="reveal">

            <div class="carousel-slide active">
                <span class="slide-tag">Complex Oligosaccharide Synthesis</span>
                <h3 class="slide-title">Synthesis of Complex Oligosaccharides and Polysaccharides</h3>
                <p class="slide-desc">Assembling nature&rsquo;s most intricate sugar chains sits at the core of our work &mdash; from milligram-scale oligosaccharides to highly branched polysaccharides built from more than one hundred monosaccharide units. Representative achievements include the first total synthesis of the 92-unit mycobacterial cell-wall arabinogalactan and a library of branched arabinogalactans up to a 140-mer from <em>Panax notoginseng</em> with anti-pancreatic-cancer activity.</p>
                <div class="slide-figure">
                    <img src="/assets/research-2-arabinogalactan-92mer.png" alt="Chemical structure of the 92-unit mycobacterial arabinogalactan assembled from Araf and Galf building blocks">
                </div>
                <p class="slide-citation"><span class="journal">Nat. Commun.</span>, 2017, 8, 14851 &nbsp;&middot;&nbsp; <span class="journal">Nat. Synth.</span>, 2024, 3, 245-255</p>
            </div>

            <div class="carousel-slide">
                <span class="slide-tag">Automated Glycan Synthesis</span>
                <h3 class="slide-title">Automated Synthesis of Complex Glycans</h3>
                <p class="slide-desc">Long, branched glycans should be accessible as routinely as small molecules, so we build automation directly into chemical synthesis. Our automated solution-phase synthesizer carries out iterative and multiplicative assembly with online monitoring and gram-scale output, and has delivered glycans up to 1080 monosaccharide units &mdash; the largest chemically defined glycan reported to date.</p>
                <div class="slide-figure">
                    <img src="/assets/research-1-automated-synthesizer.png" alt="Ye Glycosoft automated synthesizer producing oligosaccharides and polysaccharides up to a 1080-mer">
                </div>
                <p class="slide-citation"><span class="journal">Nature Synthesis</span>, 2022, 1, 854-863</p>
            </div>

            <div class="carousel-slide">
                <span class="slide-tag">Synthetic Methodology</span>
                <h3 class="slide-title">Methodology for Carbohydrate Synthesis</h3>
                <p class="slide-desc">Efficient and stereoselective formation of glycosidic bonds underpins everything above, and new methods are what make longer structures feasible. We introduced the pre-activation strategy for one-pot multi-step iterative oligosaccharide synthesis &mdash; now recognised as one of the three major strategies for chemical oligosaccharide synthesis and widely adopted worldwide &mdash; and continue to develop glycosylation methods for complex carbohydrate assembly.</p>
                <div class="slide-figure">
                    <img src="/assets/research-3-one-pot-strategy.png" alt="One-pot iterative oligosaccharide synthesis via pre-activation of glycosyl donors">
                </div>
                <p class="slide-citation"><span class="journal">Angew. Chem. Int. Ed.</span>, 2004, 43, 5221-5224</p>
            </div>

            <div class="carousel-nav">
                <button class="carousel-arrow" id="prevSlide" aria-label="Previous highlight">&#10094;</button>
                <div class="carousel-dots">
                    <button class="active" aria-label="Highlight 1"></button>
                    <button aria-label="Highlight 2"></button>
                    <button aria-label="Highlight 3"></button>
                </div>
                <button class="carousel-arrow" id="nextSlide" aria-label="Next highlight">&#10095;</button>
            </div>

        </div>
    </div>
</section>

<!-- ===================== Research Areas ===================== -->
<section id="research">
    <h2 class="section-title">Research Areas</h2>
    <p class="section-lead">Three interlocking themes drive our work</p>
    <div class="container">
        <div class="research-areas">
            <div class="research-card reveal">
                <div class="thumb" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    Oligosaccharide Synthesis
                </div>
                <h3>Synthesis of Complex Oligosaccharides</h3>
                <p>Chemical synthesis of structurally complex and biologically important oligosaccharides, including tumor-associated carbohydrate antigens and glycoconjugates.</p>
            </div>
            <div class="research-card reveal" data-delay="120">
                <div class="thumb" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    Synthetic Methodology
                </div>
                <h3>Development of Carbohydrate Synthetic Methods</h3>
                <p>Development of new glycosylation strategies and methodologies for the efficient and stereoselective construction of complex carbohydrate structures.</p>
            </div>
            <div class="research-card reveal" data-delay="240">
                <div class="thumb" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                    Chemical Glycobiology
                </div>
                <h3>Chemical Glycobiology</h3>
                <p>Exploring the roles of glycans in biological processes using chemical tools, including glycosidase and glycosyltransferase inhibitors and glycan-based probes.</p>
            </div>
        </div>
    </div>
</section>

<!-- ===================== About ===================== -->
<section class="alt-bg" id="about">
    <h2 class="section-title">About Prof. Xinshan Ye</h2>
    <div class="container">
        <div class="about-content reveal">
            <div class="about-image">
                <img src="/assets/prof-ye.png" alt="Professor Xinshan Ye">
            </div>
            <div class="about-text">
                <h3>Xinshan Ye, Ph.D.</h3>
                <p>Professor and Doctoral Supervisor at the School of Pharmaceutical Sciences, Peking University. National Science Fund for Distinguished Young Scholars recipient. Yangtze River Scholar. Chief Scientist of the National Key Research and Development Program (973 Program). Fellow of the Chinese Chemical Society.</p>

                <h4>Education</h4>
                <ul>
                    <li>1981&ndash;1985&nbsp; B.S., Department of Chemistry, Wuhan University</li>
                    <li>1985&ndash;1988&nbsp; M.S., Department of Chemistry, Wuhan University</li>
                    <li>1993&ndash;1996&nbsp; Ph.D., Department of Chemistry, The Chinese University of Hong Kong</li>
                    <li>1996&ndash;2000&nbsp; Postdoctoral Research, The Scripps Research Institute, USA</li>
                </ul>

                <h4>Professional Experience</h4>
                <ul>
                    <li>1988&ndash;1993&nbsp; Lecturer, Huazhong Agricultural University</li>
                    <li>2000&ndash;present&nbsp; Professor, School of Pharmaceutical Sciences, Peking University</li>
                    <li>2005&ndash;2012&nbsp; Director, State Key Laboratory of Natural and Biomimetic Drugs</li>
                    <li>2016&ndash;present&nbsp; Associate Dean, School of Pharmaceutical Sciences, Peking University</li>
                </ul>

                <h4>Honors &amp; Awards</h4>
                <ul>
                    <li>Second Prize of National Natural Science Award of China, 2013 (first contributor)</li>
                    <li>First Prize of Chinese Pharmaceutical Association Science &amp; Technology Award, 2011</li>
                    <li>Second Prize of Natural Science Award, Ministry of Education, 2010</li>
                    <li>13th Wu Jieping&ndash;Paul Janssen Medical &amp; Pharmaceutical Award, 2012</li>
                    <li>Zhang Shuzheng Glycoscience Award for Outstanding Achievement, 2015</li>
                    <li>Weishan Award for Natural Product Synthetic Chemistry, 2017</li>
                </ul>
            </div>
        </div>
    </div>
</section>

<!-- ===================== Highlights (short list, links out) ===================== -->
<section id="group-highlights">
    <h2 class="section-title">Highlights</h2>
    <p class="section-lead">A short selection of recent work &mdash; the full list lives on the Publications page</p>
    <div class="container">
        <div class="pub-list">
            <article class="pub-item reveal">
                <span class="pub-year">2025</span>
                <h4>Comprehensive synthesis and anticoagulant evaluation of a diverse fucoidan library</h4>
                <p class="meta">Si-Cong Chen, Xianjin Qin, Nanyu Xiong, &hellip;, Mingyi Wu*, <strong>Xin-Shan Ye*</strong></p>
                <p class="meta"><span class="journal">Nature Communications</span>, 2025, 16, 4364</p>
            </article>

            <article class="pub-item reveal" data-delay="80">
                <span class="pub-year">2024</span>
                <h4>Synthesis of branched arabinogalactans up to a 140-mer from <em>Panax notoginseng</em> and their anti-pancreatic cancer activity</h4>
                <p class="meta">Xianjin Qin, Chenghao Xu, Mingli Liu, &hellip;, Juan Mo, <strong>Xin-Shan Ye*</strong></p>
                <p class="meta"><span class="journal">Nature Synthesis</span>, 2024, 3, 245-255</p>
            </article>

            <article class="pub-item reveal" data-delay="160">
                <span class="pub-year">2022</span>
                <h4>Automated solution-phase multiplicative synthesis of complex glycans up to a 1080-mer</h4>
                <p class="meta">Wenlong Yao, De-Cai Xiong, Yun Yang, &hellip;, Miao Liu, <strong>Xin-Shan Ye*</strong></p>
                <p class="meta"><span class="journal">Nature Synthesis</span>, 2022, 1, 854-863</p>
            </article>

            <article class="pub-item reveal" data-delay="240">
                <span class="pub-year">2022</span>
                <h4>Iterative synthesis of 2-deoxyoligosaccharides enabled by stereoselective visible-light-promoted glycosylation</h4>
                <p class="meta">Kai-Meng Liu, Peng-Yu Wang, Zhen-Yan Guo, De-Cai Xiong*, &hellip;, <strong>Xin-Shan Ye*</strong></p>
                <p class="meta"><span class="journal">Angewandte Chemie International Edition</span>, 2022, 61, e202114726</p>
            </article>

            <article class="pub-item reveal" data-delay="320">
                <span class="pub-year">2017</span>
                <h4>Total synthesis of mycobacterial arabinogalactan containing 92 monosaccharide units</h4>
                <p class="meta">Yong Wu, De-Cai Xiong, Si-Cong Chen, Yong-Shi Wang, <strong>Xin-Shan Ye*</strong></p>
                <p class="meta"><span class="journal">Nature Communications</span>, 2017, 8, 14851</p>
            </article>
        </div>

        <div class="list-more reveal">
            <a href="/publications" class="btn ghost">View All Publications</a>
            <a href="/members" class="btn ghost" style="margin-left: 12px;">Meet the Group</a>
        </div>
    </div>
</section>

<!-- ===================== Contact ===================== -->
<section class="alt-bg" id="contact">
    <h2 class="section-title">Contact Us</h2>
    <div class="container">
        <div class="contact-content reveal">
            <div class="contact-info">
                <h3>Contact Information</h3>
                <p><strong>Address:</strong> Peking University Health Science Center, 38 Xueyuan Road, Beijing 100191, China</p>
                <p><strong>Tel:</strong> +86-10-82805736</p>
                <p><strong>Email:</strong> <a href="mailto:xinshan@bjmu.edu.cn">xinshan@bjmu.edu.cn</a></p>
                <p><strong>Office:</strong> Medical Science and Technology Building, Peking University</p>
            </div>
            <div class="contact-info">
                <h3>Related Links</h3>
                <p><a href="https://sps.bjmu.edu.cn/" target="_blank" rel="noopener">School of Pharmaceutical Sciences, PKU</a></p>
                <p><a href="https://www.bjmu.edu.cn/" target="_blank" rel="noopener">Peking University Health Science Center</a></p>
                <p><a href="http://sklnbd.bjmu.edu.cn/" target="_blank" rel="noopener">State Key Laboratory of Natural and Biomimetic Drugs</a></p>
            </div>
        </div>
    </div>
</section>

<footer>
    <div class="footer-content">
        <div class="footer-about">
            <h3>The Ye Group</h3>
            <p>We are dedicated to research in glycochemistry, glycopharmaceutical chemistry and chemical
               glycobiology, developing novel methodologies for oligosaccharide synthesis and exploring the
               vital roles of glycans in biological processes to contribute to human health.</p>
        </div>
        <div class="footer-links">
            <h4>Navigate</h4>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/#about">About Prof. Ye</a></li>
                <li><a href="/#research">Research Areas</a></li>
                <li><a href="/members.html">Members</a></li>
                <li><a href="/publications.html">Publications</a></li>
                <li><a href="/#contact">Contact</a></li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <p>Peking University Health Science Center, 38 Xueyuan Road, Beijing 100191, China</p>
        <p>The Ye Group &copy; 2026 All Rights Reserved</p>
    </div>
</footer>
</template>
