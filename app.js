/*
    # Endpoint
    https://api.github.com/legacy/repos/search/{query}

    Note: Github imposes a rate limit of 60 request per minute for unauthenticated users.

    Documentation can be found at http://developer.github.com/v3/.

    # Example Response JSON #

    {
      "meta": {...},
      "data": {
        "repositories": [
          {
            "type": string,
            "watchers": number,
            "followers": number,
            "username": string,
            "owner": string,
            "created": string,
            "created_at": string,
            "pushed_at": string,
            "description": string,
            "forks": number,
            "pushed": string,
            "fork": boolean,
            "size": number,
            "name": string,
            "private": boolean,
            "language": number
          },
          {...},
          {...}
        ]
      }
    }
*/
var changePage,
    showDetail,
    closeLayer;
$(function() {
  var ENTER_KEY     = 13,
      PAGE_SIZE     = 5,
      currentPage   = 1,
      start_page    = 1,
      total_pages   = 0,
      total_results = 0,
      repositories  = null,
      query         = '';

  $('#search_string').on('keyup', function(e) {
    if(e.which === ENTER_KEY) {
      //do not send new request when query the same string
      var q = $('#search_string').val().trim();
      if(query == q) {
        return ;
      } else {
        query = q;
        fetch(query, start_page);
      }
    }
  });

  function fetch(query, start_page) {
    var baseUrl = 'https://api.github.com/legacy/repos/search/';
    $.ajax({
      url: baseUrl+query+'?start_page='+start_page,
      statusCode: {
        404: function() {
          $('#results_container ul').html('<p>No Results</p>');
        }
      }
    }).done(function(data) {
      if(data && data.repositories) {
        repositories = data.repositories;
        total_results = repositories.length;
        total_pages = Math.ceil(total_results / PAGE_SIZE);
        currentPage = 1;
        render(currentPage);
      } else {
        $('#results_container ul').html('<p>No Results</p>');
      }
    });
  }

  //TODO make it shows the last page when fetch a new page
  //It seems that legacy Github API does not support pagenation by using query string in url
  //So here pagenation manully
  changePage = function(offset) {
    currentPage = currentPage + offset;
    if(currentPage < 1 && start_page <=1) {
      currentPage = 1;
      return ;
    } else if(currentPage < 1 && start_page > 1) {
      start_page = start_page - 1;
      fetch(query, start_page);
    } else if(currentPage > total_pages) {
      start_page = start_page + 1;
      fetch(query, start_page);
    } else {
      render(currentPage);
    }
  }

  //It is better if here is using javascript tamplate
  showDetail = function(num) {
    var repo = repositories[num];
    details = '<div><p>language: ' + repo.language + '</p>' +
              '<p>followers: ' + repo.followers + '</p>' +
              '<p>url: ' + repo.url + '</p>' +
              '<p>description: ' + repo.description + '</p></div>';
    $(document.body).append('<div class="overlay">'+ details + '</div>');
    $('.overlay').on('click', function(e) {
      if(e.target == e.currentTarget) {
        closeLayer();
      }
    });
  }

  closeLayer = function() {
    $('.overlay').remove();
  }

  function render(pageNum) {
    var from,
        to,
        preBtn  = '',
        nextBtn = '';
    from = (pageNum - 1) * PAGE_SIZE;
    to = pageNum * PAGE_SIZE > total_results ? total_results : pageNum * PAGE_SIZE;
    var html = '';
    for(var i=from; i<to; i++) {
      var repository = repositories[i];
      html += '<li onclick="showDetail('+ i + ')">' + repository.owner + '/' + repository.name +  '</li>';
    }
    preBtn = '<a onclick="changePage(-1);"> ←pre </a>';
    nextBtn = '<a onclick="changePage(1);"> next→ </a>';
    $('#results_container ul').html(html+preBtn+nextBtn);
  }
});
