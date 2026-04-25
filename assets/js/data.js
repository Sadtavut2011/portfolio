
    // ── SCROLL STABILITY ──
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ── LANGUAGE SWITCHER ──
    window.currentLang = localStorage.getItem('lang') || 'en';

    window.toggleLanguage = function () {
      const newLang = window.currentLang === 'en' ? 'th' : 'en';
      setLanguage(newLang);
    };

    window.setLanguage = function (lang) {
      window.currentLang = lang;
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang;

      const indicator = document.getElementById('lang-indicator');
      if (indicator) {
        indicator.innerText = lang.toUpperCase();
      }

      const textEls = document.querySelectorAll('[data-en][data-th]');
      textEls.forEach(el => {
        el.innerHTML = el.getAttribute(`data-${lang}`);
      });

      // Update current project if it's already rendered
      const mainCard = document.getElementById('main-case-study');
      if (mainCard && typeof projectsData !== 'undefined' && typeof activeProjectId !== 'undefined') {
        const p = projectsData.find(project => project.id === activeProjectId);
        if (p && !isAnimating) {

          const categoryTitleEl = document.getElementById('work-category-title');
          if (categoryTitleEl && p.categoryTitle) {
            categoryTitleEl.setAttribute('data-en', p.categoryTitle.en);
            categoryTitleEl.setAttribute('data-th', p.categoryTitle.th);
            categoryTitleEl.innerText = p.categoryTitle[lang];
          }

          // Use unified slides system
          const slide = (p.slides && p.slides.length > 0) ? p.slides[activeSlideIndex[p.id] || 0] : null;
          const displayTitle = slide ? slide.title[lang] : p.title[lang];
          const displaySubtitle = slide ? slide.subtitle[lang] : p.subtitle[lang];
          const displayDesc = slide ? slide.desc[lang] : p.desc[lang];
          const displayTags = slide ? slide.tags : p.tags;

          const caseType = mainCard.querySelector('.case-type');
          if (caseType) caseType.innerText = p.label[lang];
          const caseTitle = mainCard.querySelector('.case-title');
          // Always show title in English (locked per requirement)
          const lockedTitle = slide ? slide.title['en'] : p.title['en'];
          if (caseTitle) caseTitle.innerText = lockedTitle;
          const caseSubtitle = mainCard.querySelector('.case-subtitle');
          if (caseSubtitle) caseSubtitle.innerText = displaySubtitle;
          const caseDesc = mainCard.querySelector('.case-desc');
          if (caseDesc) caseDesc.innerHTML = displayDesc;
          const caseTags = mainCard.querySelector('.case-tags');
          if (caseTags) caseTags.innerHTML = displayTags.map(t => `<span class="case-tag">${t}</span>`).join('');

          const metaValues = mainCard.querySelectorAll('.meta-value');
          if (metaValues.length >= 4) {
            metaValues[0].innerText = p.client[lang];
            metaValues[1].innerText = p.budget[lang];
            metaValues[2].innerText = p.role[lang];
            metaValues[3].innerText = p.platform[lang];
          }

          const caseMeta = mainCard.querySelector('.case-meta');
          if (caseMeta) {
            const showMeta = slide && slide.showMeta === true;
            caseMeta.style.display = showMeta ? 'flex' : 'none';
          }
        }
      }

      // Re-render grid using new language
      if (typeof renderGrid === 'function') {
        renderGrid();
      }
    };

    // activeSlideIndex tracks the current slide per project (defined here for global hoisting)
    var activeSlideIndex = {};

    document.addEventListener('DOMContentLoaded', () => {
      setLanguage(window.currentLang);
      
      // Preload all slider images to eliminate display delay when switching slides
      if (typeof projectsData !== 'undefined') {
        projectsData.forEach(p => {
          if (p.slides) {
            p.slides.forEach(slide => {
              if (slide.img) {
                const imagePreload = new Image();
                imagePreload.src = './assets/' + slide.img;
              }
            });
          }
        });
      }

      // Initialize main project display from data
      if (typeof projectsData !== 'undefined' && typeof buildSliderHtml === 'function') {
        const caseImgEl = document.getElementById('main-case-img');
        const firstProject = projectsData.find(p => p.id === 1);
        if (caseImgEl && firstProject) {
          caseImgEl.style.background = firstProject.imgBg;
          caseImgEl.innerHTML = buildSliderHtml(firstProject);
        }
        if (typeof renderGrid === 'function') renderGrid();
      }
    });

    // Custom cursor & Hero Parallax
    const cursor = document.getElementById('cursor');
    const heroWraps = document.querySelectorAll('.hero-video-wrap');

    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';

      // Parallax effect on hero videos (inverses the mouse movement)
      const xOffset = (e.clientX / window.innerWidth - 0.5) * -30;
      const yOffset = (e.clientY / window.innerHeight - 0.5) * -30;
      heroWraps.forEach(wrap => {
        wrap.style.transform = `scale(1.04) translate(${xOffset}px, ${yOffset}px)`;
      });
    });
    document.querySelectorAll('a, .case-study, .work-ph-card, .nav-links a, .lightbox-close, .lightbox-img').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // Video loop — ensure autoplay works on mobile
    const video1 = document.getElementById('heroVideo');
    const video2 = document.getElementById('heroVideo2');
    const wrap1 = document.getElementById('heroWrap1');

    if (video1) {
      video1.play().catch(() => {
        document.addEventListener('touchstart', () => video1.play(), { once: true });
      });
      video1.addEventListener('ended', () => {
        wrap1.style.transition = 'opacity 0.6s ease-in-out';
        wrap1.style.opacity = '0';
        setTimeout(() => wrap1.remove(), 600);
      });
    }

    if (video2) {
      video2.play().catch(() => {
        document.addEventListener('touchstart', () => video2.play(), { once: true });
      });
    }

    // Scroll reveal
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.section-about, .section-work, .case-study').forEach(el => observer.observe(el));

    // ── NAVIGATION DARK MODE ON SCROLL ──
    const navbarElement = document.querySelector('nav');
    const targetAboutSection = document.querySelector('.section-about');

    if (navbarElement && targetAboutSection) {
      const navColorObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // If the About section is under the top 80px area of the viewport
          if (entry.isIntersecting) {
            navbarElement.classList.add('nav-dark');
          } else {
            navbarElement.classList.remove('nav-dark');
          }
        });
      }, {
        // Trigger precisely when the section passes the top navigation height (approx 80px)
        rootMargin: "-80px 0px -99% 0px"
      });
      navColorObserver.observe(targetAboutSection);
    }

    // ── MOBILE MENU TOGGLE ──
    const navToggle = document.getElementById('nav-toggle');
    const navBar = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (navToggle && navBar) {
      navToggle.addEventListener('click', () => {
        navBar.classList.toggle('nav-open');
        // Prevent body scroll when menu is open
        if (navBar.classList.contains('nav-open')) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });

      // Close menu when a link is clicked
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navBar.classList.remove('nav-open');
          document.body.style.overflow = '';
        });
      });
    }

    // ── UNIVERSAL SLIDER LOGIC ──
    // (activeSlideIndex is declared earlier for scope hoisting)

    window.toggleSlide = function (e, direction) {
      e.stopPropagation();
      const mainCard = document.getElementById('main-case-study');
      const project = projectsData.find(p => p.id === activeProjectId);
      if (!project || !project.slides || project.slides.length <= 1) return;

      const slides = project.slides;
      const current = activeSlideIndex[activeProjectId] || 0;
      const next = direction === 'next'
        ? (current + 1) % slides.length
        : (current - 1 + slides.length) % slides.length;

      // Animate image out
      const img = mainCard.querySelector('#main-slide-img');
      if (img) {
        const slideOut = direction === 'next' ? '-30px' : '30px';
        img.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease';
        img.style.transform = `translateX(${slideOut}) scale(0.95)`;
        img.style.opacity = '0';
      }
      // Fade text out
      const textArea = mainCard.querySelector('.case-info');
      if (textArea) { textArea.style.transition = 'opacity 0.3s ease'; textArea.style.opacity = '0'; }

      setTimeout(() => {
        activeSlideIndex[activeProjectId] = next;
        const slide = slides[next];
        const lang = window.currentLang;

        // Update image
        if (img) {
          img.src = './assets/' + slide.img;
          img.style.transition = 'none';
          const slideIn = direction === 'next' ? '30px' : '-30px';
          img.style.transform = `translateX(${slideIn}) scale(1.05)`;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            img.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease';
            img.style.transform = 'translateX(0) scale(1)';
            img.style.opacity = '1';
          }));
        }

        // Update text
        if (textArea) {
          mainCard.querySelector('.case-title').innerText = slide.title['en']; // Always English
          mainCard.querySelector('.case-subtitle').innerText = slide.subtitle[lang];
          mainCard.querySelector('.case-desc').innerHTML = slide.desc[lang];
          mainCard.querySelector('.case-tags').innerHTML = slide.tags.map(t => `<span class="case-tag">${t}</span>`).join('');
          // caseMeta: show only if slide.showMeta === true
          const caseMeta = mainCard.querySelector('.case-meta');
          if (caseMeta) caseMeta.style.display = (slide.showMeta === true) ? 'flex' : 'none';
          textArea.style.opacity = '1';
          textArea.scrollTop = 0;
        }
      }, 300);
    };

    function buildSliderHtml(project) {
      const firstSlide = project.slides ? project.slides[0] : null;
      const img = firstSlide ? firstSlide.img : '';
      const hasSlider = project.slides && project.slides.length > 1;
      const btnStyle = `position:absolute; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; border-radius:50%; width:40px; height:40px; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10; font-family:monospace; font-size:1.2rem; transition:background 0.2s;`;
      const hoverIn = `this.style.background='rgba(255,255,255,0.2)'`;
      const hoverOut = `this.style.background='rgba(255,255,255,0.1)'`;
      return `
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                <img id="main-slide-img" src="./assets/${img}" alt="${project.title ? project.title.en : ''}" style="object-fit:contain;max-width:90%;max-height:90%;width:auto;height:auto;filter:none;transition:transform 0.5s cubic-bezier(0.4,0,0.2,1),opacity 0.5s ease;">
                ${hasSlider ? `
                <button onclick="toggleSlide(event,'prev')" style="${btnStyle}left:20px;" onmouseover="${hoverIn}" onmouseout="${hoverOut}">&lt;</button>
                <button onclick="toggleSlide(event,'next')" style="${btnStyle}right:20px;" onmouseover="${hoverIn}" onmouseout="${hoverOut}">&gt;</button>
                ` : ''}
            </div>
            <div class="case-img-overlay"></div>`;
    }



    const projectsData = [
      {
        id: 1, num: "01",
        label: { en: "Mobile Application & Website", th: "แอปพลิเคชันมือถือ & เว็บไซต์" },
        categoryTitle: { en: "Project", th: "โปรเจกต์" },
        title: { en: "Thai Cleft Link", th: "Thai Cleft Link" },
        subtitle: { en: "Thai Cleft Link Program", th: "โครงการ Thai Cleft Link" },
        desc: { en: "The Thai Cleft Primary Care-Family Link Application is a comprehensive digital platform (Web & Mobile) developed to integrate the care network for patients with cleft lip, cleft palate, and craniofacial deformities across 8 provinces in Northern Thailand. Designed to overcome geographical barriers and transportation challenges for patients in remote areas, the system seamlessly connects specialized medical centers (SCFC), provincial hospitals, and Primary Care Units (PCU/Health Promoting Hospitals). This collaboration enables efficient case discovery, patient referrals, long-term follow-ups, and proactive home visits, ensuring a continuous and integrated care journey for both healthcare providers and patient families.", th: "โครงการ Thai Cleft Primary Care-Family Link Application เป็นการพัฒนาระบบแพลตฟอร์ม (Web & Mobile Application) เพื่อบูรณาการเครือข่ายการรักษาผู้ป่วยปากแหว่งเพดานโหว่และความพิการบนใบหน้า ในเขต 8 จังหวัดภาคเหนือ โดยเน้นแก้ปัญหาข้อจำกัดด้านภูมิศาสตร์และการเดินทางของผู้ป่วยในพื้นที่ห่างไกล ระบบจะเชื่อมโยงการทำงานตั้งแต่ระดับศูนย์การแพทย์เฉพาะทาง (SCFC) โรงพยาบาลต้นสังกัด ไปจนถึงโรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) ที่เป็นหน่วยบริการปฐมภูมิ (Primary Care) และครอบครัวผู้ป่วย เพื่อให้สามารถค้นหา ส่งต่อ ติดตามการรักษา และลงพื้นที่เยี่ยมบ้านเชิงรุกได้อย่างไร้รอยต่อ" },
        tags: ["UX Research", "UI Design", "Mobile App", "Healthcare", "Figma"],
        client: { en: "Chiang Mai University", th: "มหาวิทยาลัยเชียงใหม่" },
        budget: { en: "฿ 4.7M", th: "฿ 4.7M" },
        role: { en: "UX/UI Designer", th: "นักออกแบบ UX/UI" },
        platform: { en: "iOS · Android · Web", th: "iOS · Android · Web" },
        imgBg: "#1e1c2e",
        slides: [
          { img: "Projact01.png", title: { en: "Thai Cleft Link", th: "Thai Cleft Link" }, subtitle: { en: "Thai Cleft Link Program", th: "โครงการ Thai Cleft Link" }, desc: { en: "The Thai Cleft Primary Care-Family Link Application is a comprehensive digital platform (Web & Mobile) developed to integrate the care network for patients with cleft lip, cleft palate, and craniofacial deformities across 8 provinces in Northern Thailand. Designed to overcome geographical barriers and transportation challenges for patients in remote areas, the system seamlessly connects specialized medical centers (SCFC), provincial hospitals, and Primary Care Units (PCU/Health Promoting Hospitals). This collaboration enables efficient case discovery, patient referrals, long-term follow-ups, and proactive home visits, ensuring a continuous and integrated care journey for both healthcare providers and patient families.", th: "โครงการ Thai Cleft Primary Care-Family Link Application เป็นการพัฒนาระบบแพลตฟอร์ม (Web & Mobile Application) เพื่อบูรณาการเครือข่ายการรักษาผู้ป่วยปากแหว่งเพดานโหว่และความพิการบนใบหน้า ในเขต 8 จังหวัดภาคเหนือ โดยเน้นแก้ปัญหาข้อจำกัดด้านภูมิศาสตร์และการเดินทางของผู้ป่วยในพื้นที่ห่างไกล ระบบจะเชื่อมโยงการทำงานตั้งแต่ระดับศูนย์การแพทย์เฉพาะทาง (SCFC) โรงพยาบาลต้นสังกัด ไปจนถึงโรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) ที่เป็นหน่วยบริการปฐมภูมิ (Primary Care) และครอบครัวผู้ป่วย เพื่อให้สามารถค้นหา ส่งต่อ ติดตามการรักษา และลงพื้นที่เยี่ยมบ้านเชิงรุกได้อย่างไร้รอยต่อ" }, tags: ["UX Research", "UI Design", "Mobile App", "Healthcare", "Figma"], showMeta: true },
          { img: "projact02.png", title: { en: "Thai Cleft Link", th: "Thai Cleft Link" }, subtitle: { en: "Thai Cleft Link Program", th: "โครงการ Thai Cleft Link" }, desc: { en: "The Thai Cleft Primary Care-Family Link Application features six distinct user roles: 1) PCU/Health Center Staff, 2) Case Managers, 3) Hospital Personnel, 4) SCFC Officers, 5) Patients/Families, and 6) System Administrators (IT Admin). The system is developed across two primary platforms: Web and Mobile. The Mobile Application prioritizes a user-friendly and portable UI/UX design, tailored for frontline staff performing field visits and for patient families. Conversely, the Web Application is optimized for large-screen interfaces to facilitate comprehensive data dashboards and back-end management for SCFC officers and IT administrators.", th: "โครงการ Thai Cleft Primary Care-Family Link Application มีการออกแบบสิทธิ์ผู้ใช้งานทั้งหมด 6 บทบาท (Roles) ได้แก่ 1. เจ้าหน้าที่ รพ.สต. 2. Case Manager 3. เจ้าหน้าที่โรงพยาบาล 4. เจ้าหน้าที่ SCFC 5. ผู้ป่วย/ครอบครัว และ 6. ผู้บริหารระบบ (Admin IT) ระบบถูกออกแบบและพัฒนาใน 2 รูปแบบแพลตฟอร์มหลัก คือ Web Application และ Mobile Application โดย Mobile App เน้นการออกแบบ UI/UX ให้ใช้งานง่ายและพกพาสะดวก สำหรับกลุ่มผู้ปฏิบัติงานหน้างานหรือลงพื้นที่ และกลุ่มผู้ป่วย ส่วน Web App เน้นการออกแบบหน้าจอขนาดใหญ่เพื่อแสดงผล Dashboard สถิติภาพรวมและการจัดการระบบหลังบ้าน สำหรับเจ้าหน้าที่ SCFC และ Admin IT" }, tags: ["UX Research", "UI Design", "Mobile App", "Healthcare", "Figma"], showMeta: false },
          { img: "projact03.png", title: { en: "Thai Cleft Link", th: "Thai Cleft Link" }, subtitle: { en: "Thai Cleft Link Program", th: "โครงการ Thai Cleft Link" }, desc: { en: "The development of a comprehensive platform, including both Web and Mobile Applications, is designed to support the healthcare network and patients. During the process, a high-fidelity 'Clickable Prototype' or Demo was created to present to frontline users. The primary objective of this demo is to allow users to experience the actual interface and verify whether the workflow aligns with their operational practices. Throughout the testing phase, the team meticulously gathers feedback and additional requirements directly from users. This valuable insight is used to refine and finalize the design, ensuring the system is fully optimized and truly meets user needs before being handed over to the development team for the final programming stage.", th: "การสร้างแพลตฟอร์มที่ครอบคลุมทั้งรูปแบบ Web Application และ Mobile Application เพื่อรองรับการทำงานของเครือข่ายบุคลากรทางการแพทย์และผู้ป่วย ในกระบวนการทำงานได้มีการจัดทำตัวจำลองหน้าจอเสมือนจริง (Clickable Prototype) หรือตัว Demo เพื่อนำไปนำเสนอให้กับกลุ่มผู้ใช้งานหน้างาน การสร้างตัว Demo นี้มีจุดประสงค์สำคัญเพื่อให้ผู้ใช้งานได้ทดลองกดใช้งานระบบจริงและตรวจสอบลำดับขั้นตอนการทำงาน (Flow) ว่าสอดคล้องกับแนวทางการปฏิบัติงานหรือไม่ ระหว่างการทดลองใช้งาน ทีมงานจะทำการรวบรวมข้อเสนอแนะรวมถึงเก็บข้อมูลความต้องการเพิ่มเติม (Requirements) อย่างละเอียดจากผู้ใช้งานโดยตรง ข้อมูลเหล่านี้จะถูกนำมาใช้ปรับปรุงแก้ไขการออกแบบระบบให้มีความสมบูรณ์และตอบโจทย์การทำงานมากที่สุดก่อนที่จะส่งมอบให้ทีมนักพัฒนาเข้าสู่ขั้นตอนการเขียนโปรแกรมจริงต่อไป" }, tags: ["UX Research", "UI Design", "Mobile App", "Healthcare", "Figma"], showMeta: false }
        ],
        phTitle: { en: "Project", th: "โปรเจกต์" },
        phBgHtml: '<div style="position: absolute; inset: 0; background: #1e1c2e; display: flex; align-items: center; justify-content: center;"><img src="./assets/Projact01.png" style="width: 50%; height: auto; object-fit: contain;"></div><div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,26,24,0.95), transparent 60%); pointer-events: none;"></div>'
      },
      {
        id: 2, num: "02",
        label: { en: "Requirements Gathering", th: "การรวบรวมความต้องการ" },
        categoryTitle: { en: "Requirements Gathering", th: "การรวบรวมความต้องการ" },
        title: { en: "Client Workshops", th: "เวิร์กชอปกับลูกค้า" },
        subtitle: { en: "Collaborative Planning", th: "การวางแผนร่วมกัน" },
        desc: { en: "Overview of meetings, collaborative workshops, and requirement gathering sessions to ensure close alignment with client goals and user needs from the start.", th: "ภาพรวมการประชุม การทำกิจกรรมเวิร์กชอป และการรวบรวมความต้องการ เพื่อให้เป้าหมายของทีมสอดคล้องกับลูกค้าและความต้องการของผู้ใช้ตั้งแต่เริ่มต้น" },
        tags: ["UX Research", "Workshop", "Analysis"],
        client: { en: "Various", th: "หลากหลาย" }, budget: { en: "-", th: "-" }, role: { en: "UX/UI Designer", th: "นักออกแบบ UX/UI" }, platform: { en: "-", th: "-" },
        imgBg: "#1e1c2e",
        slides: [
          { img: "req01.png", title: { en: "Client Workshops", th: "เวิร์กชอปกับลูกค้า" }, subtitle: { en: "Collaborative Planning", th: "การวางแผนร่วมกัน" }, desc: { en: "Client workshop and UX/UI design presentation with the client and multidisciplinary team at Chiang Mai University. I presented both Wireframe Designs to showcase data structure and Clickable Prototypes for comprehensive workflow visualisation. Feedback gathered from this session will be used to refine and optimize the system design, ensuring it fully meets operational needs before proceeding to development.", th: "การประชุมวางแผนและนำเสนอผลงานออกแบบ UX/UI ร่วมกับทีมลูกค้าและสหสาขาวิชาชีพ ณ มหาวิทยาลัยเชียงใหม่ ผมได้นำเสนอทั้ง Wireframe Design เพื่อโชว์โครงสร้างข้อมูล และ Clickable Prototype เพื่อให้ผู้ใช้งานได้เห็นภาพขั้นตอนการทำงานที่ชัดเจน (Workflow Visualisation) โดยความเห็นที่ได้จากการประชุมนี้ จะถูกนำไปปรับปรุงแก้ไขการออกแบบระบบให้มีความสมบูรณ์และตอบโจทย์การทำงานจริงมากที่สุด" }, tags: ["UX Research", "Workshop", "Analysis"], showMeta: false },
          { img: "req02.png", title: { en: "Client Workshops", th: "เวิร์กชอปกับลูกค้า" }, subtitle: { en: "Collaborative Planning", th: "การวางแผนร่วมกัน" }, desc: { en: "A collaborative feedback session with users and clients to brainstorm and explore functional requirements and User Experience (UX) insights. I actively gathered real-world feedback to analyze and refine the system, focusing on streamlining complex workflows and enhancing operational efficiency for healthcare personnel.", th: "กิจกรรมแลกเปลี่ยนความคิดเห็นร่วมกับกลุ่มผู้ใช้งานและลูกค้า เพื่อระดมสมองและเจาะลึกถึงความต้องการที่แท้จริงในส่วนของฟังก์ชันการใช้งาน ผมและทีมได้รวบรวม Feedback ด้านประสบการณ์ผู้ใช้งาน (UX) จากหน้างานจริง เพื่อนำมาวิเคราะห์และปรับปรุงระบบให้มีความสมบูรณ์ ลดขั้นตอนที่ซับซ้อน และช่วยให้การดำเนินงานของบุคลากรทางการแพทย์มีความคล่องตัวสูงสุด" }, tags: ["UX Research", "Workshop", "Analysis"], showMeta: false },
          { img: "req03.png", title: { en: "Client Workshops", th: "เวิร์กชอปกับลูกค้า" }, subtitle: { en: "Collaborative Planning", th: "การวางแผนร่วมกัน" }, desc: { en: "On-site user testing and demo presentation at Fang Hospital in collaboration with the Chiang Mai University team. I presented the system workflow and conducted user observations to identify real-world operational challenges and constraints. The feedback and insights gained are being used to refine and optimize the application, ensuring it effectively meets the practical needs of healthcare professionals in remote medical settings.", th: "กิจกรรมลงพื้นที่ ณ โรงพยาบาลฝาง ร่วมกับทีมงานจากมหาวิทยาลัยเชียงใหม่ เพื่อนำตัวระบบ Demo ไปทดสอบการใช้งานจริงกับบุคลากรทางการแพทย์หน้างาน ผมได้นำเสนอขั้นตอนการทำงานและสังเกตการณ์การใช้งาน (User Observation) เพื่อระบุปัญหาและข้อจำกัดในการปฏิบัติงานจริง ข้อมูลและข้อเสนอแนะที่ได้รับจะถูกนำมาวิเคราะห์และปรับปรุงระบบให้สอดคล้องกับบริบทการทำงานของโรงพยาบาลในพื้นที่ห่างไกลให้มีประสิทธิภาพสูงสุด" }, tags: ["UX Research", "Workshop", "Analysis"], showMeta: false },
          { img: "req04.png", title: { en: "Client Workshops", th: "เวิร์กชอปกับลูกค้า" }, subtitle: { en: "Collaborative Planning", th: "การวางแผนร่วมกัน" }, desc: { en: "Overview of meetings, collaborative workshops, and requirement gathering sessions to ensure close alignment with client goals and user needs from the start.", th: "ภาพรวมการประชุม การทำกิจกรรมเวิร์กชอป และการรวบรวมความต้องการ เพื่อให้เป้าหมายของทีมสอดคล้องกับลูกค้าและความต้องการของผู้ใช้ตั้งแต่เริ่มต้น" }, tags: ["UX Research", "Workshop", "Analysis"], showMeta: false }
        ],
        phTitle: { en: "Requirements Gathering", th: "การรวบรวมความต้องการ" },
        phBgHtml: '<div style="position: absolute; inset: 0; background: #1e1c2e; display: flex; align-items: center; justify-content: center;"><img src="./assets/req01.png" style="width: 70%; height: auto; object-fit: contain; opacity: 0.8;"></div><div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,26,24,0.95), transparent 60%); pointer-events: none;"></div>'
      },
      {
        id: 3, num: "03",
        label: { en: "Workflow", th: "ขั้นตอนการทำงาน" },
        categoryTitle: { en: "Workflow", th: "ขั้นตอนการทำงาน" },
        title: { en: "Design System", th: "Design System" },
        subtitle: { en: "Scalable Component Library", th: "คลังคอมโพเนนต์ที่ขยายได้" },
        desc: { en: "To build a highly efficient Design System, I integrated NotebookLM as a core AI assistant to streamline the information management process. The workflow begins by feeding raw data from the TOR (Terms of Reference) and key insights from client meetings into the AI to extract and summarize critical requirements accurately.<br><br>Following the analysis, I leverage NotebookLM to generate a comprehensive PRD (Product Requirements Document). This document serves as the foundational blueprint for the entire design direction. These AI-generated insights are then translated into a robust Design System within Figma, encompassing Style Guides, Components, and detailed Guidelines. This approach ensures design consistency, precision, and seamless scalability for future project developments.", th: "ในการสร้างระบบ Design System ที่มีประสิทธิภาพ ผมได้นำเทคโนโลยี AI อย่าง NotebookLM เข้ามาเป็นผู้ช่วยหลักในการจัดการข้อมูลจำนวนมหาศาล โดยเริ่มจากการรวบรวมข้อมูลดิบจาก TOR (Terms of Reference) และสรุปประเด็นสำคัญจากการประชุมร่วมกับลูกค้า เพื่อให้มั่นใจว่าทุกความต้องการถูกจัดเก็บอย่างครบถ้วน<br><br>หลังจากนั้น ผมใช้ความสามารถของ NotebookLM ในการวิเคราะห์และร่างเอกสาร PRD (Product Requirements Document) ขึ้นมา เพื่อใช้เป็นโครงสร้างหลักในการกำหนดทิศทางของงานออกแบบ และนำข้อมูลเหล่านั้นมาพัฒนาต่อยอดเป็น Design System ภายใน Figma ซึ่งครอบคลุมทั้ง Style Guide, Components และ Guidelines ทำให้งานออกแบบมีความสอดคล้อง แม่นยำ และรองรับการขยายตัวของระบบในอนาคตได้อย่างมืออาชีพ" },
        tags: ["Design Systems", "Figma", "Guidelines"],
        client: { en: "Internal", th: "ภายในองค์กร" }, budget: { en: "-", th: "-" }, role: { en: "UX/UI Designer", th: "นักออกแบบ UX/UI" }, platform: { en: "Web", th: "เว็บ" },
        imgBg: "#1e1c2e",
        slides: [
          { img: "design system.png", title: { en: "Design System", th: "Design System" }, subtitle: { en: "Scalable Component Library", th: "คลังคอมโพเนนต์ที่ขยายได้" }, desc: { en: "To build a highly efficient Design System, I integrated NotebookLM as a core AI assistant to streamline the information management process. The workflow begins by feeding raw data from the TOR (Terms of Reference) and key insights from client meetings into the AI to extract and summarize critical requirements accurately.<br><br>Following the analysis, I leverage NotebookLM to generate a comprehensive PRD (Product Requirements Document). This document serves as the foundational blueprint for the entire design direction. These AI-generated insights are then translated into a robust Design System within Figma, encompassing Style Guides, Components, and detailed Guidelines. This approach ensures design consistency, precision, and seamless scalability for future project developments.", th: "ในการสร้างระบบ Design System ที่มีประสิทธิภาพ ผมได้นำเทคโนโลยี AI อย่าง NotebookLM เข้ามาเป็นผู้ช่วยหลักในการจัดการข้อมูลจำนวนมหาศาล โดยเริ่มจากการรวบรวมข้อมูลดิบจาก TOR (Terms of Reference) และสรุปประเด็นสำคัญจากการประชุมร่วมกับลูกค้า เพื่อให้มั่นใจว่าทุกความต้องการถูกจัดเก็บอย่างครบถ้วน<br><br>หลังจากนั้น ผมใช้ความสามารถของ NotebookLM ในการวิเคราะห์และร่างเอกสาร PRD (Product Requirements Document) ขึ้นมา เพื่อใช้เป็นโครงสร้างหลักในการกำหนดทิศทางของงานออกแบบ และนำข้อมูลเหล่านั้นมาพัฒนาต่อยอดเป็น Design System ภายใน Figma ซึ่งครอบคลุมทั้ง Style Guide, Components และ Guidelines ทำให้งานออกแบบมีความสอดคล้อง แม่นยำ และรองรับการขยายตัวของระบบในอนาคตได้อย่างมืออาชีพ" }, tags: ["Design Systems", "Figma", "Guidelines"], showMeta: false },
          { img: "workflow02.png", title: { en: "Frame Design", th: "Frame Design" }, subtitle: { en: "Frame Design", th: "การออกแบบหน้าจอ" }, desc: { en: "To transform complex business requirements into tangible designs, my workflow begins with meticulous Frame Design in Figma. I translate analyzed flowcharts into visual layouts, ensuring the User Journey is intuitive and logically structured.<br><br>I also leverage Figma Make (AI) to accelerate the drafting process and develop high-fidelity Interactive Prototypes. This enables me to provide clients with a functional Demo for realistic user testing. By allowing clients to experience the system's actual flow, we can gather immediate feedback, visualize the final product clearly, and ensure high precision before moving into the final development phase.", th: "ในการเปลี่ยนความต้องการทางธุรกิจให้กลายเป็นงานดีไซน์ที่จับต้องได้ ผมเริ่มต้นด้วยการวาง Frame Design ภายใน Figma โดยยึดตาม Flowchart ที่ผ่านการวิเคราะห์มาอย่างถี่ถ้วน เพื่อให้ลำดับการใช้งาน (User Journey) ถูกต้องและลื่นไหลที่สุด<br><br>นอกจากนี้ ผมได้ประยุกต์ใช้ Figma Make (AI) เพื่อเพิ่มความเร็วในการขึ้นโครงสร้างและสร้าง Interactive Prototype ที่สมบูรณ์แบบ สิ่งนี้ช่วยให้ผมสามารถส่งมอบตัว Demo ที่ใกล้เคียงกับระบบจริงให้ลูกค้าได้ทดลองใช้งาน (User Testing) ทำให้ลูกค้าเห็นภาพการทำงานของระบบอย่างชัดเจน และสามารถปรับปรุงแก้ไขงานได้ทันทีจาก Feedback จริง ช่วยลดระยะเวลาและเพิ่มความแม่นยำในการพัฒนาในขั้นตอนต่อไป" }, tags: ["Frame Design", "User Roles", "AI Assisted", "Design Systems"], showMeta: false },
          { img: "design system02.png", title: { en: "Frontend Development & Prototyping", th: "Frontend Development & Prototyping" }, subtitle: { en: "Frontend & Prototype", th: "ผู้เชี่ยวชาญด้าน Frontend" }, desc: { en: "To ensure a smooth transition from design to development, I develop functional prototypes with a clean and modular architecture. My workflow emphasizes a strict separation between Components, Pages, and Data layers, making the codebase highly scalable and easy to navigate.<br><br>Once the UI/UX is finalized and approved by the client, I push the production-ready frontend code to GitHub. This allows developers to immediately integrate the frontend with backend services without needing to rebuild the interface from scratch. By streamlining the handover process this way, I minimize communication gaps, eliminate redundant tasks, and ensure that the final product stays 100% faithful to the approved design.", th: "เพื่อให้โปรเจกต์สามารถพัฒนาต่อได้อย่างไร้รอยต่อ ผมได้จัดทำ Functional Prototype ที่มีการแยกสัดส่วนโครงสร้างอย่างชัดเจน ทั้งในส่วนของ Components, Pages และ Data Management ซึ่งช่วยให้โค้ดมีความเป็นระเบียบและง่ายต่อการบำรุงรักษา<br><br>เมื่อส่วนของ UI และ User Experience ได้รับการยืนยันจากลูกค้าจนนิ่งแล้ว ผมจะทำการอัปโหลดซอร์สโค้ดขึ้นบน GitHub เพื่อให้ทีม Developer สามารถนำโครงสร้าง Frontend นี้ไปพัฒนาต่อยอดในส่วนของระบบหลังบ้านได้ทันที (Production-ready) วิธีการนี้ไม่เพียงแต่ช่วยลดช่องว่างระหว่างงานออกแบบและการเขียนโปรแกรม แต่ยังช่วยลดเวลาในการทำงานซ้ำซ้อน และมั่นใจได้ว่างานที่ออกมาจะตรงตามความต้องการของลูกค้าอย่างแม่นยำที่สุด" }, tags: ["React", "TypeScript", "Tailwind CSS", "Generative AI", "Frontend"], showMeta: false },
          { img: "workflow03.png", title: { en: "AI Code Reviewer", th: "AI Code Reviewer" }, subtitle: { en: "Quality Assurance", th: "การตรวจสอบคุณภาพ" }, desc: { en: "A critical final step in my workflow is the Quality Assurance process, powered by Google Gemini (Gems). By integrating AI directly with the GitHub repository, I can cross-reference the source code against the initial requirements stored in NotebookLM. This automated audit ensures that every feature aligns with the client’s specifications and significantly reduces the risk of missing functional details.<br><br>Beyond technical accuracy, I leverage AI to act as a UX/UI Auditor through User Simulation. This allows me to evaluate the product’s usability from an end-user’s perspective, identifying potential friction points or navigation issues before the final delivery. This dual-layered verification ensures that the final product is not only functionally perfect but also provides a seamless and high-quality user experience that fully meets business objectives.", th: "ขั้นตอนสุดท้ายที่สำคัญคือการตรวจสอบคุณภาพ (Quality Assurance) โดยผมได้ใช้ Google Gemini (Gems) เชื่อมต่อเข้ากับคลังเก็บซอร์สโค้ดใน GitHub เพื่อให้ AI ทำการวิเคราะห์โค้ดและเปรียบเทียบความถูกต้องกับเอกสารความต้องการใน NotebookLM โดยละเอียด กระบวนการนี้ช่วยการันตีว่าทุกฟังก์ชันการทำงานเป็นไปตามข้อตกลงและลดความเสี่ยงจากการตกหล่นในรายละเอียดเล็กน้อย<br><br>นอกจากด้านเทคนิคแล้ว ผมยังใช้ AI ในบทบาทของ UX/UI Auditor เพื่อจำลองเป็นผู้ใช้งานจริง (User Simulation) ในการตรวจสอบความยากง่ายของการใช้งาน (Usability) หากมีจุดไหนที่อาจทำให้ผู้ใช้สับสน AI จะช่วยระบุปัญหาเหล่านั้นก่อนที่งานจะถึงมือลูกค้า ทำให้มั่นใจได้ว่างานส่งมอบสุดท้ายไม่เพียงแต่ทำงานได้ถูกต้อง แต่ยังมอบประสบการณ์การใช้งานที่ยอดเยี่ยมและตรงตามโจทย์ทางธุรกิจมากที่สุด" }, tags: ["Gemini", "NotebookLM", "GitHub", "Quality Assurance"], showMeta: false }
        ],
        phTitle: { en: "Workflow", th: "ขั้นตอนการทำงาน" },
        phBgHtml: '<div style="position: absolute; inset: 0; background: #1e1c2e; display: flex; align-items: center; justify-content: center;"><img src="./assets/design system.png" style="width: 50%; height: auto; object-fit: contain;"></div><div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,26,24,0.95), transparent 60%); pointer-events: none;"></div>'
      },
      {
        id: 4, num: "04",
        label: { en: "Tools", th: "เครื่องมือที่ใช้ในการทำงาน" },
        categoryTitle: { en: "Tools", th: "เครื่องมือที่ใช้ในการทำงาน" },
        title: { en: "Figma make / Figma Design", th: "Figma make / Figma Design" },
        subtitle: { en: "Design & Prototyping", th: "การออกแบบและสร้างโปรโตไทป์" },
        desc: { en: "Designing and managing Components, Auto Layout, and Variants in Figma Design.", th: "ออกแบบและจัดการ Components, Auto Layout ใน Figma Design" },
        tags: ["Figma Design", "Figma Make", "Prototyping", "Components"],
        client: { en: "Internal", th: "ภายในเครื่อง" }, budget: { en: "-", th: "-" }, role: { en: "UX/UI Designer", th: "นักออกแบบ UX/UI" }, platform: { en: "Mac OS", th: "Mac OS" },
        imgBg: "#1e1c2e",
        slides: [
          { img: "tools01.png", title: { en: "Figma make / Figma Design", th: "Figma make / Figma Design" }, subtitle: { en: "Design & Prototyping", th: "การออกแบบและสร้างโปรโตไทป์" }, desc: { en: "Designing and managing Components, Auto Layout, and Variants in Figma Design, as well as presenting Prototypes and Demos in Figma make.", th: "ออกแบบและจัดการ Components, Auto Layout หรือ Variants ใน Figma Design รวมถึงแสดง Prototype และ Demo ใน Figma make" }, tags: ["Figma Design", "Figma Make", "Prototyping", "Components"], showMeta: false },
          { img: "tools02.png", title: { en: "Lovable", th: "Lovable" }, subtitle: { en: "AI-Powered UI to Web", th: "แปลงดีไซน์เป็นเว็บ Prototype ด้วย AI" }, desc: { en: "Utilized Lovable to transform UI designs into functional, high-fidelity web prototypes. By leveraging AI to automate the coding process (React & Tailwind CSS), I was able to rapidly iterate on layouts and interactions, bridging the gap between design and development.", th: "ใช้ Lovable เพื่อเปลี่ยนงานดีไซน์เป็นเว็บ Prototype ที่ใช้งานได้จริง ช่วยเร่งกระบวนการสร้าง Code และทำให้เห็นภาพรวมของ Interaction ได้ทันที" }, tags: ["Lovable", "AI Tools", "React", "Tailwind CSS"], showMeta: false },
          { img: "tools03.png", title: { en: "Google Stitch", th: "Google Stitch" }, subtitle: { en: "Intelligent Ideation Partner", th: "ผู้ช่วยหาไอเดียด้วย AI" }, desc: { en: "Leveraged Google Stitch (NotebookLM) to analyze project requirements and generate suitable UI patterns for the 'Thai Cleft Link' platform. This tool served as an intelligent ideation partner, helping me discover diverse design solutions and establish a user-centric visual hierarchy.", th: "ใช้ Google Stitch ช่วยวิเคราะห์ความต้องการโปรเจกต์และสร้างรูปแบบ UI ที่เหมาะสม ช่วยหาไอเดียการออกแบบที่หลากหลาย และจัดลำดับความสำคัญของข้อมูลให้ตรงใจผู้ใช้" }, tags: ["Google Stitch", "NotebookLM", "Ideation", "AI Analysis"], showMeta: false },
          { img: "tools04.png", title: { en: "NotebookLM", th: "NotebookLM" }, subtitle: { en: "UX Research Assistant", th: "ผู้ช่วยวิจัยด้าน UX" }, desc: { en: "Leveraged NotebookLM as a research assistant to bridge the gap between complex client requests and user-centered design solutions. I used the tool to summarize key feedback and compare multiple sources of project information, which allowed me to deeply understand the user's journey and translate abstract goals into concrete UX features.", th: "ใช้ NotebookLM เป็นผู้ช่วยวิจัยเพื่อเชื่อมโยงความต้องการของลูกค้าเข้ากับโซลูชันการออกแบบที่เน้นผู้ใช้เป็นศูนย์กลาง โดยการสรุป Feedback และเปรียบเทียบข้อมูลโปรเจกต์จากหลายแหล่ง เพื่อทำความเข้าใจเส้นทางการใช้งาน (User Journey) และเปลี่ยนเป้าหมายที่ซับซ้อนให้กลายเป็นฟีเจอร์ UX ที่ชัดเจน" }, tags: ["NotebookLM", "UX Research", "AI Analysis", "User Journey"], showMeta: false },
          { img: "tools05.png", title: { en: "Gemini pro / Gemini Gem", th: "Gemini pro / Gemini Gem" }, subtitle: { en: "AI Workflow Agent", th: "ผู้ช่วยตรวจสอบคุณภาพด้วย AI" }, desc: { en: "Created an intelligent workflow using Gemini Gems to streamline the hand-off and review process. By linking technical documentation (NotebookLM) with live code repositories (GitHub), the AI Agent can automatically identify discrepancies in UI structure and code quality. This proactive approach ensures high-quality Front-end output and minimizes design debt.", th: "เพิ่มประสิทธิภาพการทำงานด้วย Gemini Gems โดยการเชื่อมต่อเอกสารทางเทคนิคเข้ากับ Code ใน GitHub เพื่อให้ AI ช่วยระบุจุดที่โค้ดไม่ตรงกับดีไซน์หรือคุณภาพไม่ได้มาตรฐาน ช่วยลดข้อผิดพลาดก่อนส่งมอบงานจริง" }, tags: ["Gemini Pro", "AI Workflow", "Design Handoff", "Quality Assurance"], showMeta: false }
        ],
        phTitle: { en: "Tools", th: "เครื่องมือที่ใช้ในการทำงาน" },
        phBgHtml: '<div style="position: absolute; inset: 0; background: #1e1c2e; display: flex; align-items: center; justify-content: center;"><img src="./assets/tools01.png" style="width: 70%; height: auto; object-fit: contain; opacity: 0.8;"></div><div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,26,24,0.95), transparent 60%); pointer-events: none;"></div>'
      }
    ];

    // activeSlideIndex tracks the current slide per project
    var activeSlideIndex = {};
    var activeProjectId = 1;
    var isAnimating = false;

    function getActiveSlide(project) {
      if (!project.slides || project.slides.length === 0) return null;
      return project.slides[activeSlideIndex[project.id] || 0];
    }

    function renderMainProject(project) {
      if (isAnimating) return;
      isAnimating = true;

      // Reset slide index for this project when switching categories
      activeSlideIndex[project.id] = activeSlideIndex[project.id] || 0;

      const mainCard = document.getElementById('main-case-study');
      if (!mainCard) {
        isAnimating = false;
        return;
      }

      // 1. Fade/Scale Out
      mainCard.style.opacity = '0';
      mainCard.style.transform = 'translateY(30px) scale(0.98)';

      setTimeout(() => {
        const lang = window.currentLang || 'en';
        const slide = getActiveSlide(project);
        const displayTitle = slide ? slide.title[lang] : project.title[lang];
        const displaySubtitle = slide ? slide.subtitle[lang] : project.subtitle[lang];
        const displayDesc = slide ? slide.desc[lang] : project.desc[lang];
        const displayTags = slide ? slide.tags : project.tags;

        // 2. Swap Content
        const categoryTitleEl = document.getElementById('work-category-title');
        if (categoryTitleEl && project.categoryTitle) {
          categoryTitleEl.setAttribute('data-en', project.categoryTitle.en);
          categoryTitleEl.setAttribute('data-th', project.categoryTitle.th);
          categoryTitleEl.innerText = project.categoryTitle[lang];
        }

        // Update "0X of 04" in header
        const headerSpan = document.querySelector('.work-header span');
        if (headerSpan) {
          headerSpan.innerText = `${project.num} of 0${projectsData.length}`;
        }

        // Build and inject slider HTML
        const caseImgEl = mainCard.querySelector('.case-img');
        if (caseImgEl) {
          caseImgEl.style.background = project.imgBg;
          caseImgEl.innerHTML = buildSliderHtml(project);
          console.log("Injected slider HTML for", project.id);
        }

        const caseNum = mainCard.querySelector('.case-num');
        if (caseNum) caseNum.innerText = project.num;

        const caseType = mainCard.querySelector('.case-type');
        if (caseType) caseType.innerText = project.label[lang];
        const caseTitle = mainCard.querySelector('.case-title');
        // Always show title in English (locked per requirement)
        const lockedTitle = slide ? slide.title['en'] : project.title['en'];
        if (caseTitle) caseTitle.innerText = lockedTitle;
        const caseSubtitle = mainCard.querySelector('.case-subtitle');
        if (caseSubtitle) caseSubtitle.innerText = displaySubtitle;
        const caseDesc = mainCard.querySelector('.case-desc');
        if (caseDesc) caseDesc.innerHTML = displayDesc;
        const caseTags = mainCard.querySelector('.case-tags');
        if (caseTags) caseTags.innerHTML = displayTags.map(tag => `<span class="case-tag">${tag}</span>`).join('');

        // Reset text area scroll position
        const caseInfo = mainCard.querySelector('.case-info');
        if (caseInfo) caseInfo.scrollTop = 0;

        const metaValues = mainCard.querySelectorAll('.meta-value');
        if (metaValues && metaValues.length >= 4) {
          metaValues[0].innerText = project.client[lang];
          metaValues[1].innerText = project.budget[lang];
          metaValues[2].innerText = project.role[lang];
          metaValues[3].innerText = project.platform[lang];
        }

        // caseMeta: show only for project id=1 && first slide has showMeta=true
        const caseMeta = mainCard.querySelector('.case-meta');
        if (caseMeta) {
          const showMeta = slide && slide.showMeta === true;
          caseMeta.style.display = showMeta ? 'flex' : 'none';
        }

        // 3. Fade/Scale In
        requestAnimationFrame(() => {
          mainCard.style.transform = 'translateY(-10px) scale(1.01)';
          requestAnimationFrame(() => {
            mainCard.style.opacity = '1';
            mainCard.style.transform = 'translateY(0) scale(1)';
            setTimeout(() => { isAnimating = false; }, 600);
          });
        });
      }, 500);
    }

    function renderGrid() {
      const grid = document.getElementById('placeholder-grid');
      grid.innerHTML = '';

      projectsData.forEach(p => {
        if (p.id === activeProjectId) return;

        const card = document.createElement('div');
        card.className = 'work-ph-card fade-in-up';
        card.style.cursor = 'pointer';

        if (p.phBgHtml) {
          card.style.padding = '0';
          card.innerHTML = `
                  ${p.phBgHtml}
                  <span class="ph-num" style="z-index: 2; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${p.num}</span>
                  <div style="position: relative; z-index: 2; padding: 1.5rem;">
                    <p class="ph-label" style="text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin-bottom: 0.4rem;">${p.label[window.currentLang]}</p>
                    <p class="ph-title" style="color: #F5F0E8; font-family: var(--font-serif); font-size: 1.1rem; font-style: italic; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${p.phTitle[window.currentLang]}</p>
                  </div>`;
        } else {
          card.innerHTML = `
                  <span class="ph-num">${p.num}</span>
                  <p class="ph-label">${p.label[window.currentLang]}</p>
                  <p class="ph-title">${p.phTitle[window.currentLang]}</p>
                `;
        }

        card.addEventListener('click', () => {
          if (isAnimating) return;
          activeProjectId = p.id;

          // Trigger view swap
          renderMainProject(p);
          renderGrid();

          // Scroll to main display
          document.getElementById('work').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Add custom cursor hover effect
        card.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
        card.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));

        // Intersection Observers for animation
        if (observer) observer.observe(card);

        grid.appendChild(card);
      });
    }

    // ── LIGHTBOX LOGIC ──
    document.addEventListener('click', function (e) {
      // Open Lightbox from Main Case Image
      const caseImg = e.target.closest('.case-img');
      const isInnerButton = e.target.closest('button');
      if (caseImg && !isInnerButton) {
        const imgEl = caseImg.querySelector('img');
        if (imgEl && imgEl.src) {
          openLightbox(imgEl.src);
        }
      }
    });

    window.openLightbox = function (src) {
      if (!src) return;
      const lb = document.getElementById('lightbox');
      const lbImg = document.getElementById('lightbox-img');
      lbImg.src = src;
      lb.classList.add('active');
    };

    window.closeLightbox = function () {
      const lb = document.getElementById('lightbox');
      lb.classList.remove('active');
      setTimeout(() => { document.getElementById('lightbox-img').src = ''; }, 400);
    };
  