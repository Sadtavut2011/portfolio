import re

with open("index.html", "r") as f:
    html = f.read()

# 1. Replace style block
html = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="./assets/css/style.css">', html, flags=re.DOTALL)

# 2. Replace nav block
html = re.sub(r'<nav>.*?</nav>', '<div id="header-placeholder"></div>', html, flags=re.DOTALL)

# 3. Replace footer block
html = re.sub(r'<footer id="contact">.*?</footer>', '<div id="footer-placeholder"></div>', html, flags=re.DOTALL)

# 4. Extract script block to save as data.js and then replace it
script_match = re.search(r'<script>(.*?)</script>', html, flags=re.DOTALL)
if script_match:
    script_content = script_match.group(1)
    with open("assets/js/data.js", "w") as f:
        f.write(script_content)
    html = re.sub(r'<script>.*?</script>', '<script src="./assets/js/data.js"></script>\n  <script src="./assets/js/main.js"></script>', html, flags=re.DOTALL)

# 5. Modify the #work section
work_replacement = """
  <section class="section-work" id="work">
    <div class="work-header">
      <h2 id="work-category-title" data-en="Categories" data-th="หมวดหมู่">Categories</h2>
    </div>

    <!-- ── 4 CATEGORY CARDS ── -->
    <div class="category-cards-grid">
      <a href="projects.html" class="cat-card">
        <div class="cat-card-bg" style="background-image: url('./assets/Projact01.png');"></div>
        <div class="cat-card-content">
          <span class="cat-num">01</span>
          <h3 data-en="Projects" data-th="ผลงาน">Projects</h3>
          <p data-en="Mobile App & Website" data-th="แอปพลิเคชันมือถือ & เว็บไซต์">Mobile App & Website</p>
        </div>
      </a>
      <a href="requirements.html" class="cat-card">
        <div class="cat-card-bg" style="background-image: url('./assets/req01.png');"></div>
        <div class="cat-card-content">
          <span class="cat-num">02</span>
          <h3 data-en="Requirements Gathering" data-th="การรวบรวมความต้องการ">Requirements Gathering</h3>
          <p data-en="Client Workshops & Analysis" data-th="เวิร์กชอปกับลูกค้า & การวิเคราะห์">Client Workshops & Analysis</p>
        </div>
      </a>
      <a href="workflow.html" class="cat-card">
        <div class="cat-card-bg" style="background-image: url('./assets/design system.png');"></div>
        <div class="cat-card-content">
          <span class="cat-num">03</span>
          <h3 data-en="Workflow" data-th="ขั้นตอนการทำงาน">Workflow</h3>
          <p data-en="Design System & Prototyping" data-th="ระบบการออกแบบและโปรโตไทป์">Design System & Prototyping</p>
        </div>
      </a>
      <a href="tools.html" class="cat-card">
        <div class="cat-card-bg" style="background-image: url('./assets/tools01.png');"></div>
        <div class="cat-card-content">
          <span class="cat-num">04</span>
          <h3 data-en="Tools" data-th="เครื่องมือ">Tools</h3>
          <p data-en="Figma, Lovable, Gemini, NotebookLM" data-th="Figma, Lovable, Gemini, NotebookLM">Figma, Lovable, Gemini, NotebookLM</p>
        </div>
      </a>
    </div>
  </section>
"""
# Find section-work and replace it
html = re.sub(r'<section class="section-work" id="work">.*?</section>', work_replacement.strip(), html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(html)

print("index.html refactored!")
