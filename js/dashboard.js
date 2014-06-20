(function () {

/*
General Utility Functions
*/

	//Get String Width - Modifies String Prototype
	getStringWidth  					= function (string, font) {
		var o = $('<div>' + string + '</div>').css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': font}).appendTo($('body')),
			w = o.width();
			o.remove();
		return w;
	};

	//Check if Object is Empty
	var isEmpty 					= function (obj) {
		for (var i in obj) {
			return false;
		};
		return true;
	};

	//Make Percentage
	var percentify 					= function (val) {
		return (val === null) ? null : ((val * 100) + "%");
	};

	//Formats numbers with commas
	function commaNumbers (num) {
		if (num === null) return null;
	    var str = num.toString().split('.');
	    if (str[0].length >= 4) {
	        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
	    }; 
	    if (str[1] && str[1].length >= 5) {
	        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
	    };
	    return str.join('.');
	};

/*
Interactive Dashboard
*/

	var Dashboard = function () {
		var dash = this;
			dash.subheader 					= '.subheader',
			dash.jsonPath 					= 'js/data/interactive.json',
			dash.vertical 					= null,
			dash.industry 					= null,
			dash.splash 					= {
				aov							: '.splashAOV',
				conversion 					: '.splashConversion',
				rpv 						: '.splashRPV'
			},
			dash.dd 						= '#selections',
			dash.ddVerticals 				= '#verticalSelect',	
			dash.ddIndustries 				= '#industrySelect',
			dash.filter 					= '.filter',
			dash.ddArrow 					= '.arrow',
			dash.screenOne 					= '#screen-1',
			dash.screenTwo 					= '#screen-2',
			dash.books 						= '.books',
			dash.bookend 					= '.bookend',
			dash.ddVertArray 				= ko.observableArray([]),
			dash.ddInduArray 				= ko.observableArray([]),
			dash.activeVertical 			= ko.observable("Verticals"),
			dash.activeIndustry 			= ko.observable("Industries"),
			dash.activeData 				= {},
			dash.activeVerticalData 		= {},
			dash.verticalOnly 				= ko.observable(true),
			dash.headDataClients 			= ko.observable(null),
			dash.headDataReviews 			= ko.observable(null),
			dash.headDataQuestions 			= ko.observable(null),
			dash.headDataAnswers 			= ko.observable(null),
			dash.headDataPageviews 			= ko.observable(null),
			dash.headDataClientsTotal 		= ko.observable(null),
			dash.headDataReviewsTotal 		= ko.observable(null),
			dash.headDataQuestionsTotal 	= ko.observable(null),
			dash.headDataAnswersTotal 		= ko.observable(null),
			dash.data;
	};

	//Initialize
	Dashboard.prototype.init							= function () {
		var dash = this;
			dash.loading();
			dash.getData(function () {
				dash.loadDropDown();
				dash.splashData();
				dash.loadingDone();
			});
	};

	Dashboard.prototype.loading 						= function (loading) {
		var dash = this;
			$('.loading .rectangle').animate({width: 236}, 1000, function () {
				$(this).animate({width: 0, left: 240}, 1000, function () {
					$(this).css("left", "4px");
					if (loading === false || typeof loading === 'undefined') {
						return
					} else {
						dash.loading(true);
					};
				});
			});
	};

	Dashboard.prototype.loadingDone 					= function () {
		var dash = this;
			dash.loading(false);
			$('.loading').fadeOut(function() {
				$('.datapoints').fadeIn();
			});
	};

	//Get JSON Data
	Dashboard.prototype.getData							= function (callback) {
		var dash = this;
			$.ajax({
				url		: dash.jsonPath,
				type	: "GET"
			}).done(function (res) {
				dash.data = res;
				console.log('XHR Notification: Data Retrieved.');
			}).fail(function () {
				console.log('XHR Alert: Failed to Retrieve JSON Data.');
			}).always(function () {
				console.log('XHR Notification: Request Complete.')
				if (typeof callback === 'function') callback();
			});
	};

	//Render Splash Data
	Dashboard.prototype.splashData 						= function () {
		var dash = this, data = dash.data;
			$(dash.splash.aov).text('+' + (100 * data.roi_rr_aov).toFixed(0) + '%');
			$(dash.splash.conversion).text('+' + (100 * data.roi_rr_conversion).toFixed(0) + '%');
			$(dash.splash.rpv).text('+' + (100 * data.roi_qa_lift_revenue_per_visit).toFixed(0) + '%');
	};

	//Load Vertical Dropdown
	Dashboard.prototype.loadDropDown 					= function () {
		var dash = this;
			$.each(this.data.verticals, function (k, v) {
				dash.ddVertArray.push(v);
			});
	};

	//Dropdown Hover State On
	Dashboard.prototype.dropdownHoverOn 				= function (e) {
		$(e.currentTarget).addClass('hover');
	};

	//Dropdown Hover State Off
	Dashboard.prototype.dropdownHoverOff 				= function (e) {
		$(e.currentTarget).removeClass('hover');
	};

	//Sets Vertical; If No Industries Sets Active Data Object Else Populates Industries Observable Array
	Dashboard.prototype.selectVertical					= function (e) {
		var dash = this, selectedVertical = e.currentTarget.value;
			dash.activeVertical(selectedVertical || "Verticals");
			$.each(dash.data.verticals, function (k, v) {
				if (v.name === selectedVertical) {
					$.each(v, function (ky, vl) {
						if (ky === 'industries') {
							dash.activeVerticalData = v;
							dash.ddInduArray([]);
							if (isEmpty(vl)) {
								dash.activeIndustry(selectedVertical);
								dash.activeData = v;
								dash.fadeScreens();
							} else {
								$.each(vl, function (key, value) {
									dash.ddInduArray.push(value);
								});
								dash.verticalOnly(false);
								$(dash.ddIndustries).removeClass('inactive');
							};
						};
					});
				};
			});
			$(dash.ddVerticals + ' ' + dash.ddArrow).addClass('selected');
	};

	//Set Industry (If Vertical Has Industries)
	Dashboard.prototype.selectIndustry					= function (e) {
		var dash = this, selectedIndustry = e.currentTarget.value;
			dash.activeIndustry(selectedIndustry || "Industries");
			$(dash.ddIndustries + ' ' + dash.ddArrow).addClass('selected');
			for (var i = 0; i < dash.ddInduArray().length; i++) {
				if (dash.ddInduArray()[i].name === dash.activeIndustry()) {
					dash.activeData = dash.ddInduArray()[i];
				};
			};
			dash.fadeScreens();
	};

	//Fade to Screen Two
	Dashboard.prototype.fadeScreens						= function () {
		var dash = this;
			dash.setBookends();
			dash.renderHead();
			$(dash.screenOne).fadeOut(function () {
				$('body').scrollTop(0);
				$(dash.screenTwo).fadeIn();
			});
	};

	//Set Bookend Lengths
	Dashboard.prototype.setBookends						= function () {
		var dash = this, books = $(dash.books), string = books.text();
			$.each(books, function (k, v) {
				var width 	= getStringWidth($(this).text(), '25px ForalPro-Bold'),
					parentWidth = $(this).parent().width(),
					bookend = $(this).siblings(dash.bookend);

					bookend.css("left", width + 8);
					bookend.width(parentWidth - 8 - width);
			});
	};

	//Render Head Data
	Dashboard.prototype.renderHead 						= function () {
		var dash = this;
			dash.headDataClients(commaNumbers(dash.activeData.clients_included)),
			dash.headDataReviews(commaNumbers(dash.activeData.total_submitted)),
			dash.headDataQuestions(commaNumbers(dash.activeData.total_questions)),
			dash.headDataAnswers(commaNumbers(dash.activeData.total_answers)),
			dash.headDataPageviews(percentify(dash.activeData.ppv_with_reviews)),
			dash.headDataClientsTotal(commaNumbers(dash.activeVerticalData.clients_included)),
			dash.headDataReviewsTotal(commaNumbers(dash.activeVerticalData.total_submitted)),
			dash.headDataQuestionsTotal(commaNumbers(dash.activeVerticalData.total_questions)),
			dash.headDataAnswersTotal(commaNumbers(dash.activeVerticalData.total_answers));
	};

	Dashboard.prototype.renderIcons						= function () {

	};
	Dashboard.prototype.renderHeader					= function () {

	};
	Dashboard.prototype.renderIndustry					= function () {

	};
	Dashboard.prototype.renderHeadData					= function () {

	};
	Dashboard.prototype.renderROIRR						= function () {

	};
	Dashboard.prototype.getROIRRScale					= function (value, total) {

	};
	Dashboard.prototype.drawROIRRChart					= function (property, x) {

	};
	Dashboard.prototype.renderROIQA						= function () {

	};
	Dashboard.prototype.drawROIQAtext					= function (property) {

	};
	Dashboard.prototype.renderAverageRating				= function () {

	};
	Dashboard.prototype.renderRatingDistribution		= function () {

	};

	var dashboard = new Dashboard ();
		dashboard.init();
		ko.applyBindings(dashboard);

/*
Event Bindings
*/

//Dropdown Mouseover
$(dashboard.dd).on("mouseover", dashboard.ddVerticals + ', ' + dashboard.ddIndustries, function (e) {
	dashboard.dropdownHoverOn(e);
})
//Dropdown Mouseover
$(dashboard.dd).on("mouseout", dashboard.ddVerticals + ', ' + dashboard.ddIndustries, function (e) {
	dashboard.dropdownHoverOff(e);
})
//Select Vertical
$(dashboard.dd).on("click", dashboard.ddVerticals + ' ' + dashboard.filter, function (e) {
	dashboard.selectVertical(e);
});
//Select Industry
$(dashboard.dd).on("click", dashboard.ddIndustries + ' ' + dashboard.filter, function (e) {
	dashboard.selectIndustry(e);
});

}(jQuery, ko))