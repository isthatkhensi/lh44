//Dropdown Filter
$(document).ready(function() {
    $('#season').on('change', function() {
      var val = $(this).val();
      if (val == 'All') {
        $(".ticket").show();
      } else {
        $('.ticket').each(function() {
          if ($(this).children(".event-meta").children("h6").text().indexOf(val) !== -1) {
            $(this).show();
          } else {
            $(this).hide();
          }
        });
      }
    });
  });
  
    $('#circuit').on('change', function() {
      var val = $(this).val();
      if ( val == 'All'){
        $(".ticket").show();
      }else{
        $('.ticket').each(function(){
          if($(this).children(".race_stats").children(".stat").children('h3').text().indexOf(val) !==-1){
            $(this).show();
          }else{
            $(this).hide();
          }
        });
      }
    });
  

// For Pitstop Queries 
const api_url = "https://ergast.com/api/f1/current/last.json";
async function getapi(url) {
    const response = await fetch(url);
    var data = await response.json();
    season = JSON.parse(data.MRData.RaceTable.season);
    round = JSON.parse(data.MRData.RaceTable.round);
    url = "https://ergast.com/api/f1/" + season  + "/" + round + "/drivers/hamilton/pitstops.json";

    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        document.getElementById("pitstops").innerHTML = data.MRData.total;
    }
    });
}
getapi(api_url);



// Paginations
(function($) {
	var pagify = {
		items: {},
		container: null,
		totalPages: 1,
		perPage: 3,
		currentPage: 0,
		createNavigation: function() {
			this.totalPages = Math.ceil(this.items.length / this.perPage);

			$('.pagination', this.container.parent()).remove();
			var pagination = $('<div class="pagination"></div>').append('<a class="nav prev disabled" data-next="false"><i class="bx bx-chevron-left"></i></a>');

			for (var i = 0; i < this.totalPages; i++) {
				var pageElClass = "page";
				if (!i)
					pageElClass = "page current";
				var pageEl = '<a class="' + pageElClass + '" data-page="' + (
				i + 1) + '">' + (
				i + 1) + "</a>";
				pagination.append(pageEl);
			}
			pagination.append('<a class="nav next" data-next="true"><i class="bx bx-chevron-right"></i></a>');

			this.container.after(pagination);

			var that = this;
			$("body").off("click", ".nav");
			this.navigator = $("body").on("click", ".nav", function() {
				var el = $(this);
				that.navigate(el.data("next"));
			});

			$("body").off("click", ".page");
			this.pageNavigator = $("body").on("click", ".page", function() {
				var el = $(this);
				that.goToPage(el.data("page"));
			});
		},
		navigate: function(next) {
			// default perPage to 5
			if (isNaN(next) || next === undefined) {
				next = true;
			}
			$(".pagination .nav").removeClass("disabled");
			if (next) {
				this.currentPage++;
				if (this.currentPage > (this.totalPages - 1))
					this.currentPage = (this.totalPages - 1);
				if (this.currentPage == (this.totalPages - 1))
					$(".pagination .nav.next").addClass("disabled");
				}
			else {
				this.currentPage--;
				if (this.currentPage < 0)
					this.currentPage = 0;
				if (this.currentPage == 0)
					$(".pagination .nav.prev").addClass("disabled");
				}

			this.showItems();
		},
		updateNavigation: function() {

			var pages = $(".pagination .page");
			pages.removeClass("current");
			$('.pagination .page[data-page="' + (
			this.currentPage + 1) + '"]').addClass("current");
		},
		goToPage: function(page) {

			this.currentPage = page - 1;

			$(".pagination .nav").removeClass("disabled");
			if (this.currentPage == (this.totalPages - 1))
				$(".pagination .nav.next").addClass("disabled");

			if (this.currentPage == 0)
				$(".pagination .nav.prev").addClass("disabled");
			this.showItems();
		},
		showItems: function() {
			this.items.hide();
			var base = this.perPage * this.currentPage;
			this.items.slice(base, base + this.perPage).show();

			this.updateNavigation();
		},
		init: function(container, items, perPage) {
			this.container = container;
			this.currentPage = 0;
			this.totalPages = 1;
			this.perPage = perPage;
			this.items = items;
			this.createNavigation();
			this.showItems();
		}
	};

	// stuff it all into a jQuery method!
	$.fn.pagify = function(perPage, itemSelector) {
		var el = $(this);
		var items = $(itemSelector, el);

		// default perPage to 5
		if (isNaN(perPage) || perPage === undefined) {
			perPage = 3;
		}

		// don't fire if fewer items than perPage
		if (items.length <= perPage) {
			return true;
		}

		pagify.init(el, items, perPage);
	};
})(jQuery);

$(".ticket-sec").pagify(15, ".ticket");


// Changing the color of the navbar background on scroll
  $(window).scroll(function(){
    $('.navbar').toggleClass('scrolled', $(this).scrollTop() > 100);
});
  