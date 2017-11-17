Array.prototype.indexOf || (Array.prototype.indexOf = function (d, e) {
  var a;
  if (null == this) throw new TypeError('"this" is null or not defined');
  var c = Object(this),
    b = c.length >>> 0;
  if (0 === b) return -1;
  a = +e || 0;
  Infinity === Math.abs(a) && (a = 0);
  if (a >= b) return -1;
  for (a = Math.max(0 <= a ? a : b - Math.abs(a), 0); a < b;) {
    if (a in c && c[a] === d) return a;
    a++
  }
  return -1
});

var all_pins = [],
  map_timer,
  all_tooltips = [],
  mapProp = {
    zoom: 15,
    // disableDefaultUI: true,
    scrollwheel: false,
    // navigationControl: false,
    mapTypeControl: false,
    scaleControl: true,
    styles: [
      {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
          {
            "saturation": "-88"
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.text",
        "stylers": [
          {
            "saturation": "-62"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#caddda"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "lightness": "-3"
          }
        ]
      }
    ]
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
  strategy_data,
  mainSlider,
  months = ["Янв", "Фев", "Март", "Апр", "Май", "Июнь", "Июль", "Авг", "Сен", "Окт", "Ноя", "Дек"];

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

function dateRu(q) {
  var date = new Date(q);

  return months[date.getMonth()] + ' ' + date.getFullYear();
}

function lineTip(q) {
  var date = new Date(q.date);

  return '<p><b>' + months[date.getMonth()] + ' ' + date.getFullYear() + '</b></p><div>Доходность стратегии с 2014 года, %: <b>' + d3.format(",.0%")(q.close / 100) + '</b></div>';
}

function initMainSlider() {
  if ($('.mainSlider').length) {
    mainSlider = $('.mainSlider').slick({
      //variableWidth: true,
      fade: true,
      dots: true,
      mobileFirst: true,
      infinite: true,
      arrows: true,
      swipe: true,
      accessibility: false,
      //autoplay: true,
      autoplay: false,
      autoplaySpeed: 5000,
      //centerMode: true,
      //variableWidth: true,
      speed: 600,
      zIndex: 1,
      initialSlide: 0,
      //asNavFor: '.activeTabSlider, .productOptionSlider',
      //centerPadding: '0',
      slide: '.mainSlider .slide',
      appendDots: '.sliderDots',
      prevArrow: '.sliderControls .slide_prev',
      nextArrow: '.sliderControls .slide_next',

      //variableWidth: true,
      slidesToShow: 1,

      slidesToScroll: 1,
      touchThreshold: 10
    });
  }
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

function formatResultSelection(rslt, e, r) {
  return rslt.text;
}

function formatResult(rslt) {
  return rslt.text;
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
    //templateResult: formatResult,
    //templateSelection: formatResultSelection
  };

  $('.select2').each(function () {
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
  var area_holder = $("#area_chart");
  var area_svg = d3.select("#area_chart").append("svg"),
    area_margin = {top: 0, right: 0, bottom: 0, left: 0}
    , area_width = area_holder.width() - area_margin.left - area_margin.right // Use the window's width
    , area_height = area_holder.height() - area_margin.top - area_margin.bottom, // Use the window's height
    area_g = area_svg
      .attr("width", area_width + area_margin.left + area_margin.right)
      .attr("height", area_height + area_margin.top + area_margin.bottom)
      .append("g").attr("transform", "translate(" + area_margin.left + "," + area_margin.top + ")");

  var area_x = d3.scaleTime()
    .rangeRound([0, area_width]);

  var area_y = d3.scaleLinear()
    .rangeRound([area_height, 0]);

  var area = d3.area()
    .x(function (d) {
      return area_x(d.date);
    })
    .y1(function (d) {
      return area_y(d.val);
    });

  var strategies = chart_data.columns.slice(1, 4).map(function (id) {
    return {
      id: id,
      values: chart_data.map(function (d) {
        return {date: d.date, val: d[id]};
      })
    };
  });

  area_x.domain(d3.extent(chart_data, function (d) {
    return d.date;
  }));

  area_y.domain([
    d3.min(strategies, function (c) {
      return d3.min(c.values, function (d) {
        return d.val;
      });
    }),
    d3.max(strategies, function (c) {
      return d3.max(c.values, function (d) {
        return d.val;
      });
    })
  ]);

  area.y0(area_y(0));

  var area_graph = area_g.selectAll(".graph")
    .data(strategies)
    .enter().append("g")
    .attr("fill", "rgba(12,174,167,.29)")
    .attr("d", area);

  area_graph.append("path")
    .attr("d", function (d) {
      return area(d.values);
    })
    .attr("class", function (d, i) {
      return 'area area_' + (i >= 3 ? (i - 2) : 0);
    });

  area_g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + area_height + ")")
    .call(
      d3.axisBottom(area_x)
        .ticks(5)
        .tickSize(-area_height)
    ).call(adjustTextLabels);

}

function loadChart() {
  var chartToggleList = $(".chartToggleList");
  var updateLegend = !(chartToggleList.children().length > 2);
  var main_holder = $("#main_chart");
  var main_svg = d3.select("#main_chart").append("svg");

  var margin = {top: 20, right: 0, bottom: 50, left: 50}
    , width = main_holder.width() - margin.left - margin.right // Use the window's width
    , height = main_holder.height() - margin.top - margin.bottom; // Use the window's height

  var g = main_svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

  var area_holder = $("#area_chart");
  var area_svg = d3.select("#area_chart").append("svg"),
    area_margin = {top: 0, right: 0, bottom: 0, left: 0}
    , area_width = area_holder.width() - area_margin.left - area_margin.right // Use the window's width
    , area_height = area_holder.height() - area_margin.top - area_margin.bottom, // Use the window's height
    area_g = area_svg
      .attr("width", area_width + area_margin.left + area_margin.right)
      .attr("height", area_height + area_margin.top + area_margin.bottom)
      .append("g").attr("transform", "translate(" + area_margin.left + "," + area_margin.top + ")");

  var x2 = d3.scaleTime()
    .rangeRound([0, area_width]);

  var y2 = d3.scaleLinear()
    .rangeRound([area_height, 0]);

  var area = d3.area()
    .x(function (d) {
      return x2(d.date);
    })
    .y1(function (d) {
      return y2(d.val);
    });

  var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2)
      .ticks(5)
      .tickSize(-area_height),
    yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width)
      .tickFormat(d3.format(",.0%"));

  var brush = d3.brushX()
    .extent([[0, 0], [area_width, area_height]])
    .on("brush end", brushed);

  var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

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

  var strategies = chart_data.columns.slice(1, 4).map(function (id) {
    return {
      id: id,
      values: chart_data.map(function (d) {
        return {date: d.date, val: d[id]};
      })
    };
  });

  x2.domain(d3.extent(chart_data, function (d) {
    return d.date;
  }));

  y2.domain([
    d3.min(strategies, function (c) {
      return d3.min(c.values, function (d) {
        return d.val;
      });
    }),
    d3.max(strategies, function (c) {
      return d3.max(c.values, function (d) {
        return d.val;
      });
    })
  ]);

  area.y0(y2(0));

  var area_graph = area_g.selectAll(".graph")
    .data(strategies)
    .enter().append("g")
    .attr("class", function (d, i) {
      return 'graph st st_' + i;
    })
    .attr("style", function (d, i) {
      return (i === 1 || i === 2 ? 'display:none' : '');
    })
    .attr("fill", "rgba(12,174,167,.29)")
    .attr("d", area);

  area_graph.append("path")
    .attr("d", function (d) {
      return area(d.values);
    });

  area_g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + area_height + ")")
    .call(xAxis2).call(adjustTextLabels);

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  g.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

  var graph = g.selectAll(".graph")
    .data(percents)
    .enter().append("g")
    .attr("class", function (d, i) {
      return 'graph ' + (i >= 3 ? 'graph_' + (i - 2) : 'st st_' + i) + (i === 1 || i === 2 ? ' hide' : '');
    });

  graph.append("path")
    .attr("d", function (d) {
      return line(d.values);
    })
    .attr("class", function (d, i) {

      if (updateLegend && i >= 3) {
        chartToggleList.append($('<li class="line_' + (i - 2) + '"><label class="check_v1 chartLabel"><input class="inp_hidden chartToggle" type="checkbox" data-chart=".graph_' + (i - 2) + '" checked=""><span class="check_text"><span>' + d.id + '</span></span></label></li>'));
      }

      return 'line line_' + (i >= 3 ? (i - 2) : 0);
    });

  graph.selectAll(".dot")
    .data(function (d) {
      return d.values;
    })
    .enter().append("circle")
    .attr("class", function (d, i) {
      return 'dot';
      //return (i % 10) ? 'dot hide' : 'dot';
    })
    .attr("cx", function (d) {
      return x(d.date);
    })
    .attr("cy", function (d, i) {
      return y(d.val);
    })
    .attr("r", 3);

  area_svg.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, x.range());

  main_svg.append("rect")
    .attr("class", "zoom")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));

    main_svg.selectAll(".line").attr("d", function (d) {
      return line(d.values);
    });

    main_svg.selectAll(".dot")
      .attr("cx", function (d) {
        return x(d.date);
      })
      .attr("cy", function (d, i) {
        return y(d.val);
      });

    main_svg.select(".axis--x").call(xAxis);
    main_svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(area_width / (s[1] - s[0]))
      .translate(-s[0], 0));
  }

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());

    //svg.select(".graph").attr("d", area);
    main_svg.select(".axis--x").call(xAxis);

    main_svg.selectAll(".line").attr("d", function (d) {
      return line(d.values);
    });

    main_svg.selectAll(".dot")
      .attr("cx", function (d) {
        return x(d.date);
      })
      .attr("cy", function (d, i) {
        return y(d.val);
      });

    area_svg.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  }

  $('.tabControl.selected').click();
}

function initPopupLine(id, data) {
// Define the div for the tooltip
  var tooltip_1 = d3.select(id).closest('.strategy_chart').append("div")
    .attr("class", "tooltip _left")
    .style("opacity", 0);

  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 60, left: 50},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// parse the date / time
  var parseTime = d3.timeParse("%d/%m/%Y");

// set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

// define the line
  var valueline = d3.line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.close);
    });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
  var svg = d3.select(id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // format the data
  data.forEach(function (d) {
    d.date = parseTime(d.date);
    d.close = +d.close;
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function (d) {
    return d.date;
  }));
  y.domain([0, d3.max(data, function (d) {
    return d.close;
  })]);

  // Add the X Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3.axisBottom(x)
        .tickFormat(dateRu)
    ).selectAll("text")
    .attr("y", 20)
    .attr("x", -40)
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "start");

  // Add the Y Axis
  svg.append("g")
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
    );

  // Add the valueline path.
  svg.append("path")
    .data([data])
    .attr("stroke", "#0caea7")
    .attr("class", "line")
    .attr("d", valueline);

  // Add the scatterplot
  svg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("r", 5)
    .attr("class", "line_dot dot")
    .attr("cx", function (d) {
      return x(d.date);
    })
    .attr("cy", function (d) {
      return y(d.close);
    })
    .on("mousemove", function (d) {
      tooltip_1.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip_1.html(lineTip(d))
        .style("left", (d3.event.layerX) + "px")
        .style("top", (d3.event.clientY - 110) + "px");
    })
    .on("mouseout", function (d) {
      tooltip_1.transition()
        .duration(500)
        .style("opacity", 0);
    });

}

function initPopupDonut_1() {
  var data = [{
    name: 'Облигации',
    percentage: 90,
    count: 90,
    color: '#9e9fa3'
  }, {
    name: 'Опционы',
    percentage: 10,
    count: 10,
    color: '#337ea6'
  }];

  var width = 540,
    height = 400;

  var arc = d3.arc()
    .outerRadius(160)
    .innerRadius(100)
    .padAngle(.01);

  var pie = d3.pie()
    .sort(null)
    .value(function (d) {
      return d.count;
    });

  var svg = d3.select('#pie_1').append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
    .data(pie(data))
    .enter().append("g");

  var tooltip_1 = d3.select("#pie_1").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  g.append("path")
    .attr("d", arc)
    .attr("class", 'donut')
    .style("fill", function (d, i) {
      return d.data.color;
    })
    .on("mousemove", function (d) {
      var parent = $(d3.event.srcElement).closest('.strategy_chart');

      console.log(d, d3.event, parent.offset().top, parent.offset().left);

      tooltip_1.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip_1.html("<span>" + d.data.name + "<span><br/><b>" + d3.format(",.1%")(d.data.percentage / 100) + "</b>")
        .style("left", (d3.event.layerX + 20) + "px")
        .style("top", (d3.event.clientY - 40) + "px");
    })
    .on("mouseout", function (d) {
      tooltip_1.transition()
        .duration(500)
        .style("opacity", 0);
    });

  g.append("text")
    .attr("transform", function (d) {
      var _d = arc.centroid(d);
      _d[0] *= 1.4;	//multiply by a constant factor
      _d[1] *= 1.4;	//multiply by a constant factor
      return "translate(" + _d + ")";
    })
    .attr("dy", ".50em")
    .attr("class", "pie_label")
    .style("text-anchor", "middle")
    .text(function (d) {
      if (d.data.percentage < 2) {
        return '';
      }
      return d.data.percentage + '%';
    });


  /*  var key = function (d) {
      console.log(d);
      return d.data.label;
    };

    var polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), key);

    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }*/


  /*  polyline.enter()
      .append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", function (d) {
        console.log(this, d);
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          var pos = arc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), arc.centroid(d2), pos];
        };
      });*/

  //polyline.exit()
  //  .remove();

  //g.append("text")
  //  .attr("text-anchor", "middle")
  //  .attr('font-size', '4em')
  //  .attr('y', 20)
  //  .text(totalCount);

}

function initPopupDonut_2() {
  var data = [{
    name: 'Финансовые инструменты',
    percentage: 58,
    count: 58,
    color: '#9e9fa3'
  }, {
    name: 'Валюта',
    percentage: 7,
    count: 7,
    color: '#337ea6'
  }, {
    name: 'Недвижимость',
    percentage: 35,
    count: 35,
    color: '#8fbb4a'
  }];

  var width = 540,
    height = 400;

  var arc = d3.arc()
    .outerRadius(160)
    .innerRadius(100)
    .padAngle(.01);

  var pie = d3.pie()
    .sort(null)
    .value(function (d) {
      return d.count;
    });

  var svg = d3.select('#pie_2').append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
    .data(pie(data))
    .enter().append("g");

  var tooltip_2 = d3.select("#pie_2").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  g.append("path")
    .attr("d", arc)
    .attr("class", 'donut')
    .style("fill", function (d, i) {
      return d.data.color;
    })
    .on("mousemove", function (d) {
      var parent = $(d3.event.srcElement).closest('.strategy_chart');

      console.log(d, d3.event, parent.offset().top, parent.offset().left);

      tooltip_2.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip_2.html("<span>" + d.data.name + "<span><br/><b>" + d3.format(",.1%")(d.data.percentage / 100) + "</b>")
        .style("left", (d3.event.layerX + 20) + "px")
        .style("top", (d3.event.clientY - 40) + "px");
    })
    .on("mouseout", function (d) {
      tooltip_2.transition()
        .duration(500)
        .style("opacity", 0);
    });

  g.append("text")
    .attr("transform", function (d) {
      var _d = arc.centroid(d);
      _d[0] *= 1.4;	//multiply by a constant factor
      _d[1] *= 1.4;	//multiply by a constant factor
      return "translate(" + _d + ")";
    })
    .attr("dy", ".50em")
    .attr("class", "pie_label")
    .style("text-anchor", "middle")
    .text(function (d) {
      if (d.data.percentage < 2) {
        return '';
      }
      return d.data.percentage + '%';
    });


  /*  var key = function (d) {
      console.log(d);
      return d.data.label;
    };

    var polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), key);

    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }*/


  /*  polyline.enter()
      .append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", function (d) {
        console.log(this, d);
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          var pos = arc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), arc.centroid(d2), pos];
        };
      });*/

  //polyline.exit()
  //  .remove();

  //g.append("text")
  //  .attr("text-anchor", "middle")
  //  .attr('font-size', '4em')
  //  .attr('y', 20)
  //  .text(totalCount);

}

function initPopupDonut_3() {
  var data = [{
    name: 'Валюта',
    percentage: 80,
    count: 80,
    color: '#9e9fa3'
  }, {
    name: 'Сырье',
    percentage: 20,
    count: 20,
    color: '#337ea6'
  }];

  var width = 540,
    height = 400;

  var arc = d3.arc()
    .outerRadius(160)
    .innerRadius(100)
    .padAngle(.01);

  var pie = d3.pie()
    .sort(null)
    .value(function (d) {
      return d.count;
    });

  var svg = d3.select('#pie_3').append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
    .data(pie(data))
    .enter().append("g");

  var tooltip_3 = d3.select("#pie_3").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  g.append("path")
    .attr("d", arc)
    .attr("class", 'donut')
    .style("fill", function (d, i) {
      return d.data.color;
    })
    .on("mousemove", function (d) {
      var parent = $(d3.event.srcElement).closest('.strategy_chart');

      console.log(d, d3.event, parent.offset().top, parent.offset().left);

      tooltip_3.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip_3.html("<span>" + d.data.name + "<span><br/><b>" + d3.format(",.1%")(d.data.percentage / 100) + "</b>")
        .style("left", (d3.event.layerX + 20) + "px")
        .style("top", (d3.event.clientY - 40) + "px");
    })
    .on("mouseout", function (d) {
      tooltip_3.transition()
        .duration(500)
        .style("opacity", 0);
    });

  g.append("text")
    .attr("transform", function (d) {
      var _d = arc.centroid(d);
      _d[0] *= 1.4;	//multiply by a constant factor
      _d[1] *= 1.4;	//multiply by a constant factor
      return "translate(" + _d + ")";
    })
    .attr("dy", ".50em")
    .attr("class", "pie_label")
    .style("text-anchor", "middle")
    .text(function (d) {
      if (d.data.percentage < 2) {
        return '';
      }
      return d.data.percentage + '%';
    });


  /*  var key = function (d) {
      console.log(d);
      return d.data.label;
    };

    var polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), key);

    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }*/


  /*  polyline.enter()
      .append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", function (d) {
        console.log(this, d);
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          var pos = arc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), arc.centroid(d2), pos];
        };
      });*/

  //polyline.exit()
  //  .remove();

  //g.append("text")
  //  .attr("text-anchor", "middle")
  //  .attr('font-size', '4em')
  //  .attr('y', 20)
  //  .text(totalCount);

}

function initChart() {
  if ($("#main_chart").length) {
    var parseTime = d3.timeParse("%d/%m/%Y");

    function type(d, _, columns) {
      d.date = parseTime(d.date);
      for (var i = 1, n = columns.length, c; i < n; ++i) {
        d[c = columns[i]] = +(d[c]).replace(/,/, '.');
      }
      return d;
    }

    d3.tsv("data/all.tsv", type, function (error, data) {
      if (error) throw error;

      chart_data = data;

      loadChart();
    });
  }
}

function updateFade() {
  if (wnd) {
    var scrtop = getScrollTop(), wndH = wnd.innerHeight();

    $('.fadeMeUp:not(.fade_up)').each(function (ind) {
      var blck = $(this);

      if ((scrtop + wndH * .9) > blck.offset().top) {
        blck.addClass('fade_up');
      }
    });
  }
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

  //loadAreaChart();
}

function toggleChart(chck) {
  var chrt = d3.selectAll('#main_chart .graph' + chck.attr('data-chart'));
  chrt.classed('hide', !chck.prop('checked'));
}

function defProp(chck) {
  var def = $('.tabControl.selected').attr('data-default'), index = $('.chartToggle').index(chck);

  if (def && def.length) {
    var arr = def.split(',');

    if (chck.prop('checked')) {
      arr.push(index);
    } else {
      var find = arr.indexOf(index + '');

      if (find > -1) {
        arr.splice(find, 1);
      }
    }
  }

  $('.tabControl.selected').attr('data-default', arr.join(','));
}

function initValidation() {
  $('.validateMe').each(function (ind) {
    var f = $(this);

    f.validationEngine({
      binded: true,
      scroll: false,
      showPrompts: true,
      showArrow: false,
      addSuccessCssClassToField: 'success',
      addFailureCssClassToField: 'error',
      parentFieldClass: '.formCell',
      // parentFormClass: '.order_block',
      promptPosition: "centerRight",
      //doNotShowAllErrosOnSubmit: true,
      //focusFirstField          : false,
      autoHidePrompt: true,
      autoHideDelay: 3000,
      autoPositionUpdate: false,
      prettySelect: true,
      //useSuffix                : "_VE_field",
      addPromptClass: 'relative_mode one_msg',
      showOneMessage: false
    });
  });
}

function initScrollBars() {

  if ($('.mCSB').length) {
    $('.mCSB').mCustomScrollbar({
      documentTouchScroll: true,
      mouseWheel: {
        preventDefault: true
      },
      theme: "dark",
      scrollEasing: "linear"
    });
  }
}

function findStrategy(btn) {
  //GET DATA
  var age = $('.strategyForm [name="age"]').val();
  var sum = $('.strategyForm [name="sum"]').val();
  var period = $('.strategyForm [name="period"]').val();
  var risk = $('.strategyForm [name="risk"]').val();

  var result = "";

  //CALC

  if ((age === 3) && (sum === 3) && (period === 3) && (risk === 1)) {
    result = 'Консервативная стратегия';
    $('#st_1').css({'display': 'block'});

  } else if ((age === 2) && (sum === 1) && (period === 1) && (risk === 4)) {
    result = 'Высокодоходная стратегия';
    $('#st_3').css({'display': 'block'});
  } else {
    result = 'Средневзвешенная стратегия';
    $('#st_2').css({'display': 'block'});
  }

  btn.addClass('_loading');

  setTimeout(function () {
    $('.calcResult').show();

    $('.strategyName').html(result);

    btn.removeClass('_loading');

  }, 2000);
}

function initHomePage() {
  d3.selection.prototype.closest = function (selector) {
    var closestMatch = undefined;
    var matchArr = [];
    this.each(function () {
      var elm = this;
      while (typeof elm.parentNode.matches === "function" && !closestMatch) {
        elm = elm.parentNode;
        if (elm.matches(selector)) {
          closestMatch = elm;
          matchArr.push(closestMatch);
        }
      }
      closestMatch = undefined;
    });
    return d3.selectAll(matchArr);
  };

  initPopupLine('#chart_1', [
    {
      date: '1/1/2014',
      close: 3.62
    },
    {
      date: '1/4/2014',
      close: 6.12
    },
    {
      date: '1/7/2014',
      close: 9.92
    },
    {
      date: '1/10/2014',
      close: 13.10
    },
    {
      date: '1/1/2015',
      close: 16.97
    },
    {
      date: '1/4/2015',
      close: 20.68
    },
    {
      date: '1/7/2015',
      close: 23.64
    },
    {
      date: '1/10/2015',
      close: 26.71
    },
    {
      date: '1/1/2016',
      close: 29.65
    },
    {
      date: '1/4/2016',
      close: 30.68
    },
    {
      date: '1/7/2016',
      close: 34.50
    },
    {
      date: '1/10/2016',
      close: 34.77
    },
    {
      date: '1/1/2017',
      close: 40.35
    }
  ]);

  initPopupLine('#chart_2', [
    {
      date: '1/1/2014',
      close: 9.12
    },
    {
      date: '1/4/2014',
      close: 16.44
    },
    {
      date: '1/7/2014',
      close: 24.65
    },
    {
      date: '1/10/2014',
      close: 32.49
    },
    {
      date: '1/1/2015',
      close: 41.09
    },
    {
      date: '1/4/2015',
      close: 48.55
    },
    {
      date: '1/7/2015',
      close: 54.66
    },
    {
      date: '1/10/2015',
      close: 61.61
    },
    {
      date: '1/1/2016',
      close: 68.69
    },
    {
      date: '1/4/2016',
      close: 75.52
    },
    {
      date: '1/7/2016',
      close: 81.92
    },
    {
      date: '1/10/2016',
      close: 90.79
    },
    {
      date: '1/1/2017',
      close: 96.57
    }
  ]);

  initPopupLine('#chart_3', [
    {
      date: '1/1/2014',
      close: -1.94
    },
    {
      date: '1/4/2014',
      close: 4.77
    },
    {
      date: '1/7/2014',
      close: 13.15
    },
    {
      date: '1/10/2014',
      close: 13.13
    },
    {
      date: '1/1/2015',
      close: 21.12
    },
    {
      date: '1/4/2015',
      close: 22.31
    },
    {
      date: '1/7/2015',
      close: 28.30
    },
    {
      date: '1/10/2015',
      close: 29.24
    },
    {
      date: '1/1/2016',
      close: 38.07
    },
    {
      date: '1/4/2016',
      close: 44.37
    },
    {
      date: '1/7/2016',
      close: 50.66
    },
    {
      date: '1/10/2016',
      close: 57.22
    },
    {
      date: '1/1/2017',
      close: 66.68
    }
  ]);

  initPopupDonut_1();

  initPopupDonut_2();

  initPopupDonut_3();

  initGallery();

}

function initGallery() {
  if ($('.diplomaList').length) {
    $('.diplomaList').lightGallery({
      selector: '.diplomaLink',
      speed: 200,
      thumbnail: true,
      zoom: true,
      dynamic: false,
      download: false,
      scale: .5,
      enableZoomAfter: 0,
      actualSize: true
    });
  }
}

$(function ($) {
  wnd = $(window);
  body_var = $('body');

  initSelect();

  //initValidation();

  //confirmDialogDefaults();

  initScrollBars();

  initMainSlider();

  initChart();

  if (body_var.hasClass('home')) {
    initHomePage();
  }

  //$('.calcResult').show();

  body_var.delegate('.sendOrder', 'submit', function (e) {
    e.preventDefault();

    return false;
  }).delegate('.sendOrder button', 'click', function (e) {
    e.preventDefault();

    var form = $(this).closest('form'), form_data = form.serialize(); //собераем все данные из формы

    if (form.find('.agreement').prop('checked')) {
      $.ajax({
        type: form.attr('method'), //Метод отправки
        url: form.attr('action'), //путь до php фаила отправителя
        data: form_data,
        success: function () {
          yaCounter45518583.reachGoal('MAIN_FORM');
          //код в этом блоке выполняется при успешной отправке сообщения
          form.closest('.callback_holder').find('.respond').show();

          form[0].reset();

          setTimeout(function () {
            form.closest('.callback_holder').find('.respond').hide();
          }, 3000);
        }
      });
    }

    return false;

  }).delegate('.check_v1', 'click', function (e) {
    var lbl = $(this);

    if (!lbl.find('input').length) {
      var inp = $('#' + lbl.attr('for'));

      if (inp.length) {
        inp.prop('checked', !inp.prop('checked'));
      }
    }

  }).delegate('.select2', 'change', function (e) {
    $(this).validationEngine('validate');
  }).delegate('.strategyForm', 'submit', function (e) {
    e.preventDefault();
    yaCounter45518583.reachGoal('CALC');

    if ($(this).validationEngine('validate')) {
      findStrategy($('.strategyBtn'));
    }

    return false;
  }).delegate('.calcResult', 'click', function (e) {
    if ($(e.target).hasClass('calcResult')) {
      $(e.target).hide();
    }
    return false;
  }).delegate('.popupClose', 'click', function () {
    $('.calcResult').hide();
    return false;
  }).delegate('.infoBtn', 'click', function () {
    $(this).closest('.info_unit').toggleClass('_opened');
    return false;
  }).delegate('.chartToggle', 'change', function () {
    var chck = $(this);

    toggleChart(chck);

    defProp(chck);

  }).delegate('.tabControl', 'click', function () {
    var tab = $(this), ind = tab.index(), chck = $('.chartLabel').eq(ind).find('input'),
      def_check = tab.attr('data-default'), dis_check = tab.attr('data-disable');

    $($('.strategyInfo').eq(ind)).show().siblings('.strategyInfo').hide();

    tab.siblings('.tabControl').removeClass('selected').end().addClass('selected');

    $('.chartLabel').eq(tab.index()).show().siblings().hide();

    d3.selectAll('#main_chart ' + chck.attr('data-chart')).classed('hide', !chck.prop('checked'));

    $('.st').hide().filter(chck.attr('data-chart')).show();

    if (def_check && def_check.length) {
      var check_arr = def_check.split(',');

      $('.chartToggle').each(function (ind) {
        toggleChart($(this).prop('checked', check_arr.indexOf(ind + '') > -1));
      });
    }

    if (def_check && def_check.length) {
      var disabled_arr = dis_check.split(',');

      $('.chartToggle').each(function (ind) {
        var chrt = d3.selectAll('#main_chart .graph' + ind);

        if (disabled_arr.indexOf(ind + '') > -1) {
          chrt.classed('hide', true);
          $('.chartLabel').eq(ind).closest('li').hide();
        } else {
          chrt.classed('hide', false);
          $('.chartLabel').eq(ind).closest('li').show();
        }
      });
    }

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
