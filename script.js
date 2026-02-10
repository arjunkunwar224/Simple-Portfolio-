/* ═══════════════════════════════════════════════════════════
   PORTFOLIO — MAIN JAVASCRIPT
   Interactivity, Libraries, Blog CRUD, Photo Upload
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── AOS INIT ───
    AOS.init({
        duration: 700,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80,
    });

    // ─── TYPED.JS — HERO TAGLINE ───
    new Typed('#typed-output', {
        strings: [
            'Full-Stack Developer',
            'UI/UX Enthusiast',
            'Open Source Contributor',
            'Problem Solver',
        ],
        typeSpeed: 55,
        backSpeed: 35,
        backDelay: 2000,
        loop: true,
        smartBackspace: true,
    });

    // ─── PARTICLES.JS — HERO BACKGROUND ───
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 40, density: { enable: true, value_area: 1000 } },
                color: { value: '#d1d5db' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true, anim: { enable: true, speed: 0.4, opacity_min: 0.1 } },
                size: { value: 2.5, random: true, anim: { enable: false } },
                line_linked: { enable: true, distance: 150, color: '#d1d5db', opacity: 0.12, width: 1 },
                move: { enable: true, speed: 0.6, direction: 'none', random: true, straight: false, out_mode: 'out' },
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true,
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.2 } },
                    push: { particles_nb: 3 },
                },
            },
            retina_detect: true,
        });
    }

    // ─── VANILLA TILT — PROJECT CARDS ───
    const tiltCards = document.querySelectorAll('[data-tilt]');
    if (typeof VanillaTilt !== 'undefined' && tiltCards.length) {
        VanillaTilt.init(tiltCards, {
            max: 5,
            speed: 400,
            glare: true,
            'max-glare': 0.08,
        });
    }


    // ═══════════════════════════════════════════════════════
    //  NAVIGATION
    // ═══════════════════════════════════════════════════════

    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navLinkEls = document.querySelectorAll('.nav-link:not(.resume-btn)');
    const sections = document.querySelectorAll('section[id]');

    // Toggle mobile menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', navLinks.classList.contains('active'));
    });

    // Close menu on link click
    navLinkEls.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        header.classList.toggle('scrolled', scrollY > 50);

        // Active nav link
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (scrollY >= top) current = sec.getAttribute('id');
        });
        navLinkEls.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });

        lastScroll = scrollY;
    });


    // ═══════════════════════════════════════════════════════
    //  PHOTO UPLOAD (ABOUT SECTION)
    // ═══════════════════════════════════════════════════════

    const photoPlaceholder = document.getElementById('photoPlaceholder');
    const photoUpload = document.getElementById('photoUpload');
    const aboutPhoto = document.getElementById('aboutPhoto');

    // Load saved photo
    const savedPhoto = localStorage.getItem('portfolio_photo');
    if (savedPhoto) {
        aboutPhoto.src = savedPhoto;
        aboutPhoto.classList.remove('hidden');
        photoPlaceholder.classList.add('hidden');
    }

    photoPlaceholder.addEventListener('click', () => photoUpload.click());

    // Also allow clicking the photo itself to re-upload
    aboutPhoto.addEventListener('click', () => photoUpload.click());

    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file.', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be smaller than 5MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            aboutPhoto.src = ev.target.result;
            aboutPhoto.classList.remove('hidden');
            photoPlaceholder.classList.add('hidden');
            localStorage.setItem('portfolio_photo', ev.target.result);
            showToast('Photo uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    });


    // ═══════════════════════════════════════════════════════
    //  BLOG SYSTEM (localStorage CRUD)
    // ═══════════════════════════════════════════════════════

    const blogModal = document.getElementById('blogModal');
    const blogViewModal = document.getElementById('blogViewModal');
    const newBlogBtn = document.getElementById('newBlogBtn');
    const blogModalClose = document.getElementById('blogModalClose');
    const blogViewClose = document.getElementById('blogViewClose');
    const blogForm = document.getElementById('blogForm');
    const blogGrid = document.getElementById('blogGrid');
    const blogFileArea = document.getElementById('blogFileArea');
    const blogFile = document.getElementById('blogFile');
    const blogFileName = document.getElementById('blogFileName');
    const blogContent = document.getElementById('blogContent');

    // Open/close blog write modal
    newBlogBtn.addEventListener('click', () => openModal(blogModal));
    blogModalClose.addEventListener('click', () => closeModal(blogModal));
    blogViewClose.addEventListener('click', () => closeModal(blogViewModal));

    // Close modal on overlay click
    [blogModal, blogViewModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(blogModal);
            closeModal(blogViewModal);
        }
    });

    // File upload area
    blogFileArea.addEventListener('click', () => blogFile.click());

    blogFileArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        blogFileArea.style.borderColor = 'var(--accent)';
        blogFileArea.style.background = 'var(--accent-dim)';
    });

    blogFileArea.addEventListener('dragleave', () => {
        blogFileArea.style.borderColor = '';
        blogFileArea.style.background = '';
    });

    blogFileArea.addEventListener('drop', (e) => {
        e.preventDefault();
        blogFileArea.style.borderColor = '';
        blogFileArea.style.background = '';
        const file = e.dataTransfer.files[0];
        if (file) handleBlogFile(file);
    });

    blogFile.addEventListener('change', (e) => {
        if (e.target.files[0]) handleBlogFile(e.target.files[0]);
    });

    function handleBlogFile(file) {
        const allowed = ['.txt', '.md', '.html'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowed.includes(ext)) {
            showToast('Only .txt, .md, or .html files are allowed.', 'error');
            return;
        }
        blogFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (ev) => {
            blogContent.value = ev.target.result;
        };
        reader.readAsText(file);
    }

    // Submit blog post
    blogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('blogTitle').value.trim();
        const tag = document.getElementById('blogTag').value;
        const content = blogContent.value.trim();

        if (!title || !content) {
            showToast('Please fill in the title and content.', 'error');
            return;
        }

        const post = {
            id: Date.now(),
            title,
            tag,
            content,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            }),
            excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        };

        const posts = getBlogs();
        posts.unshift(post);
        localStorage.setItem('portfolio_blogs', JSON.stringify(posts));

        blogForm.reset();
        blogFileName.textContent = '';
        closeModal(blogModal);
        renderBlogs();
        showToast('Blog post published!', 'success');
    });

    function getBlogs() {
        try {
            return JSON.parse(localStorage.getItem('portfolio_blogs')) || [];
        } catch {
            return [];
        }
    }

    function renderBlogs() {
        const posts = getBlogs();
        if (!posts.length) return; // Keep default demo cards

        // Clear grid and render from localStorage
        blogGrid.innerHTML = '';
        posts.forEach((post, index) => {
            const card = document.createElement('article');
            card.className = 'blog-card';
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', `${(index % 3) * 100}`);
            card.innerHTML = `
                <div class="blog-card-image">
                    <div class="blog-card-tag">${escHtml(post.tag)}</div>
                </div>
                <div class="blog-card-body">
                    <span class="blog-date"><i class="fa-regular fa-calendar"></i> ${escHtml(post.date)}</span>
                    <h3 class="blog-card-title">${escHtml(post.title)}</h3>
                    <p class="blog-card-excerpt">${escHtml(post.excerpt)}</p>
                    <a href="#" class="blog-read-more" data-blog-id="${post.id}">Read More <i class="fa-solid fa-arrow-right"></i></a>
                    <button class="blog-delete-btn" data-delete-id="${post.id}"><i class="fa-solid fa-trash-can"></i> Delete</button>
                </div>
            `;
            blogGrid.appendChild(card);
        });

        AOS.refresh();
        attachBlogListeners();
    }

    function attachBlogListeners() {
        // Read more
        document.querySelectorAll('.blog-read-more[data-blog-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = parseInt(btn.dataset.blogId);
                const posts = getBlogs();
                const post = posts.find(p => p.id === id);
                if (!post) return;

                document.getElementById('blogViewTitle').textContent = post.title;
                document.getElementById('blogViewBody').innerHTML = `
                    <div class="blog-view-meta">
                        <span><i class="fa-regular fa-calendar"></i> ${escHtml(post.date)}</span>
                        <span><i class="fa-solid fa-tag"></i> ${escHtml(post.tag)}</span>
                    </div>
                    <div class="blog-view-content">${escHtml(post.content)}</div>
                `;
                openModal(blogViewModal);
            });
        });

        // Delete
        document.querySelectorAll('.blog-delete-btn[data-delete-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.deleteId);
                let posts = getBlogs();
                posts = posts.filter(p => p.id !== id);
                localStorage.setItem('portfolio_blogs', JSON.stringify(posts));
                renderBlogs();
                showToast('Blog post deleted.', 'info');

                // If all posts deleted, reload to show demo cards
                if (!posts.length) location.reload();
            });
        });
    }

    // Attach listeners to demo "Read More" links (non-dynamic)
    document.querySelectorAll('.blog-read-more:not([data-blog-id])').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.blog-card');
            const title = card.querySelector('.blog-card-title').textContent;
            const excerpt = card.querySelector('.blog-card-excerpt').textContent;
            const tag = card.querySelector('.blog-card-tag').textContent;
            const date = card.querySelector('.blog-date').textContent;

            document.getElementById('blogViewTitle').textContent = title;
            document.getElementById('blogViewBody').innerHTML = `
                <div class="blog-view-meta">
                    <span>${date}</span>
                    <span><i class="fa-solid fa-tag"></i> ${tag}</span>
                </div>
                <div class="blog-view-content">${excerpt}\n\nMore description to be added soon...</div>
            `;
            openModal(blogViewModal);
        });
    });

    // On page load, render user blogs if any exist
    if (getBlogs().length) renderBlogs();


    // ═══════════════════════════════════════════════════════
    //  RESUME DOWNLOAD
    // ═══════════════════════════════════════════════════════

    const resumeFab = document.getElementById('resumeFab');
    const navResumeBtn = document.getElementById('navResumeBtn');

    function handleResumeDownload(e) {
        e.preventDefault();
        // If user has placed a resume.pdf in assets/, this would download it.
        // For demo: show a helpful toast.
        const resumeUrl = 'assets/resume.pdf';

        // Try a fetch to see if resume exists
        fetch(resumeUrl, { method: 'HEAD' })
            .then(res => {
                if (res.ok) {
                    const a = document.createElement('a');
                    a.href = resumeUrl;
                    a.download = 'Resume.pdf';
                    a.click();
                    showToast('Resume download started!', 'success');
                } else {
                    showToast('Place your resume.pdf in the assets/ folder to enable download.', 'info');
                }
            })
            .catch(() => {
                showToast('Place your resume.pdf in the assets/ folder to enable download.', 'info');
            });
    }

    resumeFab.addEventListener('click', handleResumeDownload);
    navResumeBtn.addEventListener('click', handleResumeDownload);


    // ═══════════════════════════════════════════════════════
    //  CONTACT FORM
    // ═══════════════════════════════════════════════════════

    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        if (!name || !email || !message) {
            formStatus.textContent = 'Please fill in all required fields.';
            formStatus.className = 'form-status error';
            return;
        }

        if (!isValidEmail(email)) {
            formStatus.textContent = 'Please enter a valid email address.';
            formStatus.className = 'form-status error';
            return;
        }

        // Simulated send
        const btn = contactForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

        setTimeout(() => {
            formStatus.textContent = 'Message sent successfully! I\'ll get back to you soon.';
            formStatus.className = 'form-status success';
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
            contactForm.reset();
            showToast('Message sent!', 'success');

            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }, 5000);
        }, 1500);
    });


    // ═══════════════════════════════════════════════════════
    //  UTILITIES
    // ═══════════════════════════════════════════════════════

    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        // Restore scrolling only if no other modals open
        const anyOpen = document.querySelector('.modal-overlay.active');
        if (!anyOpen) document.body.style.overflow = '';
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            info: 'fa-circle-info',
        };
        toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3500);
    }

});
