document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('docs-section');
  if (!container || !Array.isArray(window.documentBuckets)) return;
  container.innerHTML = '';

  window.documentBuckets.forEach(bucket => {
    const bucketEl = document.createElement('div');
    bucketEl.className = 'doc-bucket';

    const heading = document.createElement('h3');
    heading.textContent = bucket.label;
    bucketEl.appendChild(heading);

    if (bucket.description) {
      const desc = document.createElement('p');
      desc.textContent = bucket.description;
      bucketEl.appendChild(desc);
    }

    bucket.sections
      .filter(section => Array.isArray(section.files) && section.files.length > 0)
      .forEach(section => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'doc-section';

        const sectionHeading = document.createElement('h4');
        sectionHeading.textContent = section.label;
        sectionEl.appendChild(sectionHeading);

        if (section.description) {
          const sectionDesc = document.createElement('p');
          sectionDesc.textContent = section.description;
          sectionDesc.style.marginTop = '0.4rem';
          sectionEl.appendChild(sectionDesc);
        }

        const list = document.createElement('div');
        list.className = 'doc-items';

        section.files.forEach(file => {
          const link = document.createElement('a');
          link.className = 'doc-item';
          link.href = file.url;
          link.target = '_blank';
          link.rel = 'noreferrer noopener';

          const title = document.createElement('span');
          title.textContent = file.name;

          const meta = document.createElement('small');
          meta.textContent = file.size ? `${file.type} • ${file.size}` : file.type;

          link.appendChild(title);
          link.appendChild(meta);
          list.appendChild(link);
        });

        sectionEl.appendChild(list);
        bucketEl.appendChild(sectionEl);
      });

    container.appendChild(bucketEl);
  });
});
