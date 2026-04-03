(function () {
  const container = document.getElementById('medium-latest');
  if (!container) return;

  const profileUrl = 'https://medium.com/@mikewyantjr';
  const feedUrl = 'https://medium.com/feed/@mikewyantjr';
  const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);

  function createFallback() {
    container.innerHTML = '<p><a href="' + profileUrl + '" target="_blank" rel="noopener">Read more posts on Medium</a></p>';
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  fetch(apiUrl)
    .then(function (response) {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.items) || !data.items.length) {
        createFallback();
        return;
      }

      const item = data.items[0];
      const title = item.title || 'Latest post on Medium';
      const link = item.link || profileUrl;
      const pubDate = item.pubDate ? new Date(item.pubDate) : null;
      const description = stripHtml(item.description || '').slice(0, 260).trim();
      const formattedDate = pubDate ? pubDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

      var html = '';
      if (formattedDate) {
        html += '<div class="medium-meta">' + formattedDate + '</div>';
      }
      html += '<h3 class="medium-title"><a href="' + link + '" target="_blank" rel="noopener">' + title + '</a></h3>';
      if (description) {
        html += '<p class="medium-excerpt">' + description + (description.length === 260 ? '…' : '') + '</p>';
      }
      html += '<p><a class="button w-button" href="' + link + '" target="_blank" rel="noopener">Read on Medium</a></p>';

      container.innerHTML = html;
    })
    .catch(function () {
      createFallback();
    });
})();
