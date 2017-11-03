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
  gmap,
  center,
  body_var,
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

  setTimeout(function () {
    center = new google.maps.LatLng(47.301969, 39.715053);
    gmap = new google.maps.Map(document.getElementById("qbf_map"), mapProp);
    gmap.setCenter(center);

    createPin(gmap, 'KSK', {
      lat: 47.301969,
      lng: 39.715053
    });

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

          console.log(form_data);

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

function initChart() {
  var svg_holder = $("#main_chart");
  var parse = d3.timeParse("%d-%b-%y");

  d3.text("data/chart_3.csv", function (text) {
    console.log(d3.csvParseRows(text));
    console.log(d3.csvFormatRows(d3.csvParseRows(text)));
  });
  
  d3.csv("data/chart_3.csv", function (prices) {
    //prices is an array of json objects containing the data in from the csv
    console.log("prices:", prices);

// 2. Use the margin convention practice 
    var margin = {top: 50, right: 50, bottom: 50, left: 50}
      , width = svg_holder.width() - margin.left - margin.right // Use the window's width 
      , height = svg_holder.height() - margin.top - margin.bottom; // Use the window's height

// The number of datapoints
    var n = 21;

// 5. X scale will use the index of our data
    var xScale = d3.scaleLinear()
      .domain([0, n - 1]) // input
      .range([0, width]); // output

// 6. Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear()
      .domain([0, 1]) // input 
      .range([height, 0]); // output 

// 7. d3's line generator
    var line = d3.line()
      .x(function (d, i) {
        return xScale(i);
      }) // set the x values for the line generator
      .y(function (d) {
        return yScale(d.y);
      }) // set the y values for the line generator 
      .curve(d3.curveMonotoneX) // apply smoothing to the line

// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
    var dataset = d3.range(n).map(function (d) {
      return {"y": d3.randomUniform(1)()}
    });

    //var dataset = prices.map(function (d) {
    //  //each d is one line of the csv file represented as a json object
    //  console.log("d", d, new Date(d.date));
    //  month = (new Date(d.date)).getMonth();
    //  console.log("month:", d.date, month);
    //  //we slice the dollar sign off then convert to a number with the + sign
    //  //slicing works like "$216".slice(1) gives you 216, 
    //  //you can also give it a range like "$216 asdf".slice(1,4) gives you 216
    //  p = d.price;
    //  price = +p.slice(1);
    //  console.log("price:", p, price);
    //  return {"month": month, "value": price};
    //});
    //
    //console.log("data", data);

// 1. Add the SVG to the page and employ #2
    var svg = d3.select("#main_chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 3. Call the x axis in a group tag
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// 4. Call the y axis in a group tag
    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator 
    svg.append("path")
      .datum(dataset) // 10. Binds data to the line 
      .attr("class", "line") // Assign a class for styling 
      .attr("d", line); // 11. Calls the line generator 

// 12. Appends a circle for each datapoint 
    svg.selectAll(".dot")
      .data(dataset)
      .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function (d, i) {
        return xScale(i)
      })
      .attr("cy", function (d) {
        return yScale(d.y)
      })
      .attr("r", 5);
  });


}

$(window).resize(function () {

});

$(function ($) {

  body_var = $('body');

  initSelect();

  //confirmDialogDefaults();

  initMainSlider();

  initChart();

  body_var.delegate('.tabControl', 'click', function () {
    $(this).siblings().removeClass('selected').end().next('.tab_unit').andSelf().addClass('selected');
    return false;
  }).delegate('.scrollTo', 'click', function () {
    var target = $($(this).attr('href'));

    if (target.length) {
      docScrollTo(target.offset().top, 600);
    }

    return false;
  });

});
