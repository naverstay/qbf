var all_pins = [],
  map_timer,
  all_tooltips = [],
  mapProp = {
    zoom: 15,
    // disableDefaultUI: true,
    scrollwheel: false,
    // navigationControl: false,
    mapTypeControl: false,
    scaleControl: true
  },
  wnd,
  resize_timer,
  gmap,
  map_offices = [
    {lt: 59.931915, lg: 30.401380}, // SPb
    {lt: 55.747233, lg: 37.539156}, // MSK
    {lt: 56.846286, lg: 60.588952}, // Eburg
    {lt: 54.717821, lg: 20.497307}, // Kenig
    {lt: 57.146477, lg: 65.557076} // Tumen
  ],
  center,
  body_var,
  chart_data,
  area_data,
  mainSlider;

function docScrollTo(pos, speed, callback) {

  $('html,body').animate({'scrollTop': pos}, speed, function () {
    if (typeof(callback) == 'function') {
      callback();
    }
  });
}

function loadMap() {

  // без таймаута не работает :(

  var lt = map_offices[0].lt;
  var lg = map_offices[0].lg;

  setTimeout(function () {
    center = new google.maps.LatLng(lt, lg);
    gmap = new google.maps.Map(document.getElementById("qbf_map"), mapProp);
    gmap.setCenter(center);

    for (var i = 0; i < map_offices.length; i++) {
      var office = map_offices[i];

      createPin(gmap, 'QBF', {
        lat: office.lt,
        lng: office.lg
      }, 'i/pin.png');
    }
  }, 0);
}

function confirmDialogDefaults() {
  jconfirm.defaults = {
    title: '',
    titleClass: '',
    type: 'default',
    typeAnimated: true,
    draggable: true,
    dragWindowGap: 15,
    dragWindowBorder: true,
    animateFromElement: true,
    smoothContent: true,
    content: '',
    buttons: {},
    defaultButtons: {
      ok: {
        action: function () {
        }
      },
      close: {
        action: function () {
        }
      }
    },
    contentLoaded: function (data, status, xhr) {
    },
    icon: '',
    lazyOpen: false,
    bgOpacity: null,
    theme: 'light',
    animation: 'scale',
    closeAnimation: 'scale',
    animationSpeed: 400,
    animationBounce: 1,
    rtl: false,
    container: 'body',
    containerFluid: true,
    backgroundDismiss: false,
    backgroundDismissAnimation: 'shake',
    autoClose: false,
    closeIcon: true,
    closeIconClass: '',
    watchInterval: 100,
    columnClass: '',
    boxWidth: '95%',
    scrollToPreviousElement: true,
    scrollToPreviousElementAnimate: true,
    useBootstrap: true,
    offsetTop: 10,
    offsetBottom: 10,
    onContentReady: function () {
    },
    onOpenBefore: function () {
    },
    onOpen: function () {
      body_var.addClass('confirm_opened');
    },
    onClose: function () {
      body_var.removeClass('confirm_opened');
    },
    onDestroy: function () {
      body_var.removeClass('confirm_opened');
    },
    onAction: function () {
    }
  };
}

function callbackDialog() {
  $.confirm({
    title: '',
    content: $('#callback_popup').html(),
    columnClass: 'callback_dialog',
    buttons: {
      confirm: {
        btnClass: 'btn_v2 action_btn_2 order_btn',
        text: '<span class="btn_text">отправить заявку</span>',
        action: function () {

          var form_data = $('.popupForm').serialize(); //собераем все данные из формы

          $.ajax({
            type: "POST", //Метод отправки
            url: "order.php", //путь до php фаила отправителя
            data: form_data,
            success: function () {
              //код в этом блоке выполняется при успешной отправке сообщения
              $.alert({
                columnClass: 'callback_alert',
                type: 'green',
                title: "Ваше сообщение отправлено!"
              });
            }
          });
        }
      }
    }
  });
}

function initMainSlider() {

  mainSlider = $('.mainSlider').slick({
    //variableWidth: true,
    dots: true,
    mobileFirst: true,
    infinite: true,
    arrows: false,
    swipe: true,
    accessibility: false,
    autoplay: false,
    autoplaySpeed: 3000,
    //centerMode: true,
    //variableWidth: true,
    speed: 600,
    zIndex: 1,
    initialSlide: 0,
    //asNavFor: '.activeTabSlider, .productOptionSlider',
    //centerPadding: '0',
    slide: '.mainSlider .slide',
    appendDots: '.sliderDots',
    //prevArrow: '.serviceSlider .slide_prev',
    //nextArrow: '.serviceSlider .slide_next',

    //variableWidth: true,
    slidesToShow: 1,

    slidesToScroll: 1,
    touchThreshold: 10
  });

}

function createPin(target_map, name, latlng, icon, icon_hover, magic_top_offset) {
  var img = new Image(), marker;

  if (icon && icon.length) {
    $(img).one('load', function () {
      var image = new google.maps.MarkerImage(
        icon,
        new google.maps.Size(img.width, img.height),
        new google.maps.Point(0, 0),
        new google.maps.Point((img.width / 2).toFixed(), img.height + (magic_top_offset || 0))
      );

      marker = new google.maps.Marker({
        position: latlng,
        map: target_map,
        icon: image,
        title: name
      });

      if (icon_hover && icon_hover.length) {
        google.maps.event.addListener(marker, 'mouseover', function () {
          marker.setIcon(icon_hover);
        });
        google.maps.event.addListener(marker, 'mouseout', function () {
          marker.setIcon(icon);
        });
      }

      return marker;
    });

    img.src = icon;

  } else {
    marker = new google.maps.Marker({
      position: latlng,
      map: target_map,
      title: name
    });

    if (icon_hover && icon_hover.length) {
      google.maps.event.addListener(marker, 'mouseover', function () {
        marker.setIcon(icon_hover);
      });
      google.maps.event.addListener(marker, 'mouseout', function () {
        marker.setIcon(icon);
      });
    }

    return marker;
  }
}

function plural(n, str1, str2, str5) {
  return n + ' ' + ((((n % 10) === 1) && ((n % 100) !== 11)) ? (str1) : (((((n % 10) >= 2) && ((n % 10) <= 4)) && (((n % 100) < 10) || ((n % 100) >= 20))) ? (str2) : (str5)))
}

function initSelect() {
  $.fn.select2.amd.define('select2/i18n/ru', [], function () {
    // Russian
    return {
      errorLoading: function () {
        return 'Результат не может быть загружен.';
      },
      inputTooLong: function (args) {
        var overChars = args.input.length - args.maximum;
        return 'Пожалуйста, удалите ' + overChars + ' символ' + plural(overChars, '', 'а', 'ов');
      },
      inputTooShort: function (args) {
        var remainingChars = args.minimum - args.input.length;
        return 'Пожалуйста, введите ' + remainingChars + ' или более символов';
      },
      loadingMore: function () {
        return 'Загружаем ещё ресурсы…';
      },
      maximumSelected: function (args) {
        var message = 'Вы можете выбрать ' + args.maximum + ' элемент' + plural(args.maximum, '', 'а', 'ов');

        if (args.maximum >= 2 && args.maximum <= 4) {
          message += 'а';
        } else if (args.maximum >= 5) {
          message += 'ов';
        }

        return message;
      },
      noResults: function () {
        return 'Ничего не найдено';
      },
      searching: function () {
        return 'Поиск…';
      }
    };
  });

  var s2options = {
    language: 'ru',
    width: '100%',
    closeOnSelect: true,
    allowClear: false,
    minimumResultsForSearch: Infinity,
    containerCssClass: "select_c2"
  };

  $('.select2').each(function (ind) {
    var $slct = $(this),
      cls = $slct.attr('data-select-class') || '',
      opt = {
        placeholder: $slct.attr('data-placeholder') || 'Выберите...',
        dropdownParent: $slct.parent(),
        adaptDropdownCssClass: function (c) {
          return cls;
        }
      };

    opt = $.extend({}, opt, s2options);

    $slct.select2(opt);
  });
}

function adjustTextLabels(selection) {
  selection.selectAll('.tick text')
    .attr('transform', 'translate(20,-30)');
}

function loadAreaChart() {
  var svg_holder = $("#area_chart");
  var svg = d3.select("#area_chart").append("svg"),
    margin = {top: 0, right: 0, bottom: 0, left: 0}
    , width = svg_holder.width() - margin.left - margin.right // Use the window's width 
    , height = svg_holder.height() - margin.top - margin.bottom, // Use the window's height
    g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime()
    .rangeRound([0, width]);

  var y = d3.scaleLinear()
    .rangeRound([height, 0]);

  var area = d3.area()
    .x(function (d) {
      return x(d.date);
    })
    .y1(function (d) {
      return y(d.val);
    });

  x.domain(d3.extent(area_data, function (d) {
    return d.date;
  }));
  y.domain([0, d3.max(area_data, function (d) {
    return d.val;
  })]);

  area.y0(y(0));

  g.append("path")
    .datum(area_data)
    .attr("fill", "rgba(12,174,167,.29)")
    .attr("d", area);

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3.axisBottom(x)
        .ticks(5)
        .tickSize(-height)
    ).call(adjustTextLabels);

}

function initAreaChart() {
  var parseTime = d3.timeParse("%d/%m/%Y");

  function type(d, _, columns) {
    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) {
      d[c = columns[i]] = +(d[c]).replace(/,/, '.');
    }
    return d;
  }

  d3.csv("data/chart_5.csv", type, function (error, data) {
    if (error) throw error;

    area_data = data;

    loadAreaChart();
  });
}

function loadChart() {
  var chartToggleList = $(".chartToggleList");
  var updateLegend = !(chartToggleList.children().length > 2);
  var svg_holder = $("#main_chart");
  var svg = d3.select("#main_chart").append("svg");

  var margin = {top: 20, right: 0, bottom: 50, left: 50}
    , width = svg_holder.width() - margin.left - margin.right // Use the window's width 
    , height = svg_holder.height() - margin.top - margin.bottom; // Use the window's height

  var g = svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
    .curve(d3.curveLinear)
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.val);
    });

  var percents = chart_data.columns.slice(1).map(function (id) {
    return {
      id: id,
      values: chart_data.map(function (d) {
        return {date: d.date, val: d[id]};
      })
    };
  });

  x.domain(d3.extent(chart_data, function (d) {
    return d.date;
  }));

  y.domain([
    d3.min(percents, function (c) {
      return d3.min(c.values, function (d) {
        return d.val;
      });
    }),
    d3.max(percents, function (c) {
      return d3.max(c.values, function (d) {
        return d.val;
      });
    })
  ]);

  z.domain(percents.map(function (c) {
    return c.id;
  }));

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "axis axis--y")
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(d3.format(",.0%"))
    );

  var graph = g.selectAll(".graph")
    .data(percents)
    .enter().append("g")
    .attr("class", function (d, i) {
      return 'graph graph_' + i;
    });

  graph.append("path")
    .attr("d", function (d) {
      return line(d.values);
    })
    .attr("class", function (d, i) {

      if (updateLegend) {
        chartToggleList.append($('<li class="line_' + (i + 1) + '"><label class="check_v1"><input class="inp_hidden chartToggle" type="checkbox" data-chart=".graph_' + (i + 1) + '" checked=""><span class="check_text">' + d.id + '</span></label></li>'));
      }

      return 'line line_' + i;
    });

  graph.selectAll(".dot")
    .data(function (d) {
      return d.values;
    })
    .enter().append("circle") // Uses the enter().append() method
    .attr("class", function (d, i) {
      return 'dot';
      //return (i % 10) ? 'dot hide' : 'dot';
    }) // Assign a class for styling
    .attr("cx", function (d) {
      return x(d.date);
    })
    .attr("cy", function (d, i) {
      return y(d.val);
    })
    .attr("r", 5);
}

function initChart() {
  var parseTime = d3.timeParse("%d/%m/%Y");

  function type(d, _, columns) {
    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) {
      d[c = columns[i]] = +(d[c]).replace(/,/, '.');
    }
    return d;
  }

  d3.csv("data/chart_4.csv", type, function (error, data) {
    if (error) throw error;

    chart_data = data;

    loadChart();
  });
}

function updateFade() {
  var scrtop = getScrollTop(), wndH = wnd.innerHeight();

  $('.fadeMeUp:not(.fade_up)').each(function (ind) {
    var blck = $(this);

    if ((scrtop + wndH * .9) > blck.offset().top) {
      blck.addClass('fade_up');
    }
  });
}

function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

$(window).on('resize', function () {
  clearTimeout(resize_timer);

  resize_timer = setTimeout(function () {
    updateGraph();
  }, 1);
}).on('scroll', function () {
  updateFade();
}).on('load', function () {
  updateFade();
});

function updateGraph() {
  $("#main_chart,#area_chart").empty();

  loadChart();

  loadAreaChart();
}

$(function ($) {

  wnd = $(window);
  body_var = $('body');

  initSelect();

  //confirmDialogDefaults();

  initMainSlider();

  initChart();

  initAreaChart();

  body_var.delegate('.chartToggle', 'change', function () {
    var chck = $(this), chrt = $('.graph' + chck.attr('data-chart'));
    chrt.toggle(chck.prop('checked'));
  }).delegate('.tabControl', 'click', function () {
    $(this).siblings().removeClass('selected').end().next('.tab_unit').andSelf().addClass('selected');
    return false;
  }).delegate('.scrollTo', 'click', function () {
    var target = $($(this).attr('href'));

    if (target.length) {
      docScrollTo(target.offset().top, 600);
    }

    return false;
  }).delegate('.officeSwitch', 'change', function () {
    var chck = $(this);

    if (chck.prop('checked')) {
      var ind = +chck.attr('value');
      var office = map_offices[ind];

      $('.officeAddr').eq(ind).show().siblings().hide();

      center = new google.maps.LatLng(office.lt, office.lg);
      gmap.setCenter(center);
    }
  });
});
