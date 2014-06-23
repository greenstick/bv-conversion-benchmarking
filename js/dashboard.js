(function () {

/*
General Utility Functions
*/

	//Get String Width - Modifies String Prototype
	var getStringWidth  			= function (string, font) {
		var o = $('<div>' + string + '</div>').css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': font}).appendTo($('body')),
			w = o.width();
			o.remove();
		return w;
	};

	//Check if Object is Empty
	var isEmpty 					= function (obj) {
		for (var i in obj) {return false}; return true;
	};

	//Accepts Value, Decimal Place, and Whether '%' Should Be Appended or Not
	var percentify 					= function (val, dec, str) {
		return (val === null) ? null : (str === true) ? ((val * 100).toFixed(dec) + "%") : (val * 100).toFixed(dec);
	};

	//Formats numbers with commas
	var commaNumbers 				= function (num) {
		if (num === null) return null;
	    var str = num.toString().split('.');
	    if (str[0].length >= 4) {
	        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '1,');
	    }; 
	    if (str[1] && str[1].length >= 5) {
	        str[1] = str[1].replace(/(\d{3})/g, '1 ');
	    };
	    return str.join('.');
	};
	//Remaps Value in Range to new Range
	var remapValue 					= function (x, l1, h1, l2, h2) {
		return l2 + (x - l1) * (h2 -l2) / (h1 - l1);
	};
	//Takes a Number and returns a Rounding Factor
	var setRoundedMax 				= function (num) {
		var fStr 	= String(num).charAt(0),
			first 	= Number(fStr),
			length 	= (num.toString()).length,
			round 	= (length === 1) ? num : (length === 2) 
					? Math.ceil(num/10) * 10 : (length === 3) 
					? Math.ceil(num/100) * 100 : (length === 4) 
					? Math.ceil(num/1000) * 1000 : (length === 5)
					? Math.ceil(num/10000) * 10000 : (length === 6)
					? Math.ceil(num/100000) * 100000 : (length === 7)
					? Math.ceil(num/1000000) * 1000000 : console.log('Error on setRoundUp Function: Value too large.'); 
		return (first * round);
	};

/*
Interactive Dashboard Viewmodel
*/

	var Dashboard = function () {
		var dash = this;
			dash.jsonPath 					= 'js/data/interactive.json',
			dash.vertical 					= null,
			dash.industry 					= null,
			//CSS Classes
			dash.splash 					= {
				aov							: '.splashAOV',
				conversion 					: '.splashConversion',
				rpv 						: '.splashRPV'
			},
			dash.content 					= '#content',
			dash.dd 						= '#selections',
			dash.ddVerticals 				= '#verticalSelect',	
			dash.ddIndustries 				= '#industrySelect',
			dash.filter 					= '.filter',
			dash.ddArrow 					= '.arrow',
			dash.screenOne 					= '#screen-1',
			dash.screenTwo 					= '#screen-2',
			dash.books 						= '.books',
			dash.bookend 					= '.bookend',
			dash.subheader 					= '.subheader',
			dash.s1Height 					= 864,
			dash.s2Height 					= 2028,
			//General Data Access Observables
			dash.ddVertArray 				= ko.observableArray([]),
			dash.ddInduArray 				= ko.observableArray([]),
			dash.activeVertical 			= ko.observable("Verticals"),
			dash.activeIndustry 			= ko.observable("Industries"),
			dash.activeIcon 				= ko.observable(null),
			//Active Data Objects
			dash.activeData 				= {},
			dash.activeVerticalData 		= {},
			//If Vertical Has No Industries
			dash.verticalOnly 				= ko.observable(true),
			//Header Data Observables
			dash.headDataClients 			= ko.observable(null),
			dash.headDataReviews 			= ko.observable(null),
			dash.headDataQuestions 			= ko.observable(null),
			dash.headDataAnswers 			= ko.observable(null),
			dash.headDataPageviews 			= ko.observable(null),
			dash.headDataClientsTotal 		= ko.observable(null),
			dash.headDataReviewsTotal 		= ko.observable(null),
			dash.headDataQuestionsTotal 	= ko.observable(null),
			dash.headDataAnswersTotal 		= ko.observable(null),
			//RR Data Module Variables & Observables
			dash.showRRIndustryBars 		= ko.observable(false),
			dash.rrAovAll 					= ko.observable(null),
			dash.rrConversionAll 			= ko.observable(null),
			dash.rrRpvAll 					= ko.observable(null),
			dash.rrAovIndustry				= ko.observable(null),
			dash.rrConversionIndustry		= ko.observable(null),
			dash.rrRpvIndustry 				= ko.observable(null),
			dash.rrAovAllPercent 			= ko.observable(null),
			dash.rrConversionAllPercent 	= ko.observable(null),
			dash.rrRpvAllPercent 			= ko.observable(null),
			dash.rrAovIndustryPercent		= ko.observable(null),
			dash.rrConversionIndustryPercent= ko.observable(null),
			dash.rrRpvIndustryPercent 		= ko.observable(null),
			dash.rrMax 						= ko.observable(null),
			dash.rrMid			 			= ko.observable(null),
			dash.rrMin 						= ko.observable(null),
			//QA Data Module Observables
			dash.qaAovAll 					= ko.observable(null),
			dash.qaConversionAll			= ko.observable(null),
			dash.qaRpvAll					= ko.observable(null),
			//AR Data Module Observables
			dash.arIndustry 				= ko.observable(null),
			dash.arAll 						= ko.observable(null),
			//RD Data Module Observables
			dash.rd5 						= ko.observable(null),
			dash.rd4 						= ko.observable(null),
			dash.rd3 						= ko.observable(null),
			dash.rd2 						= ko.observable(null),
			dash.rd1 						= ko.observable(null),
			dash.rd5Text					= ko.observable(null),
			dash.rd4Text					= ko.observable(null),
			dash.rd3Text					= ko.observable(null),
			dash.rd2Text 					= ko.observable(null),
			dash.rd1Text 					= ko.observable(null),
			//Stores JSON Data Object for Reference
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

	//Loading Animation
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

	//Loading Complete
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
								dash.activeIcon(dash.activeData.icon_name);
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
					dash.activeIcon(dash.ddInduArray()[i].icon_name);
				};
			};
			dash.fadeScreens();
	};

	//Fade Screens - Sets Bookends & Renders Data Head + Modules
	Dashboard.prototype.fadeScreens						= function () {
		var dash = this;
			dash.setBookends('25px ForalPro-Bold', 10);
			dash.renderHead();
			dash.renderRRModule();
			dash.renderQAModule();
			dash.renderARModule();
			dash.renderRDModule();
			$(dash.screenOne).fadeOut(function () {
				$('body').scrollTop(0);
				$(dash.screenTwo).fadeIn();
			});
	};

	//Set Bookend Lengths
	Dashboard.prototype.setBookends						= function (font, padding) {
		var dash = this, books = $(dash.books), string = books.text();
			$.each(books, function (k, v) {
				var width 	= getStringWidth($(this).text(), font),
					parentWidth = $(this).parent().width(),
					bookend = $(this).siblings(dash.bookend);
					bookend.css("left", width + padding);
					bookend.width(parentWidth - padding - width);
			});
	};

	//Render Head Data
	Dashboard.prototype.renderHead 						= function () {
		var dash = this;
			dash.headDataClients(commaNumbers(dash.activeData.clients_included)),
			dash.headDataReviews(commaNumbers(dash.activeData.total_submitted)),
			dash.headDataQuestions(commaNumbers(dash.activeData.total_questions)),
			dash.headDataAnswers(commaNumbers(dash.activeData.total_answers)),
			dash.headDataPageviews(percentify(dash.activeData.ppv_with_reviews, 0, true)),
			dash.headDataClientsTotal(commaNumbers(dash.activeVerticalData.clients_included)),
			dash.headDataReviewsTotal(commaNumbers(dash.activeVerticalData.total_submitted)),
			dash.headDataQuestionsTotal(commaNumbers(dash.activeVerticalData.total_questions)),
			dash.headDataAnswersTotal(commaNumbers(dash.activeVerticalData.total_answers));
	};

	//Renders Ratings & Reviews Data Module
	Dashboard.prototype.renderRRModule 					= function () {
		var dash = this;
			aovMax 			= Math.max(dash.data.roi_rr_aov, dash.activeData.roi_rr_aov),
			conversionMax 	= Math.max(dash.data.roi_rr_conversion, dash.activeData.roi_rr_conversion),
			rpvMax 			= Math.max(dash.data.roi_rr_revenue_per_visit, dash.activeData.roi_rr_revenue_per_visit),
			absMax 			= Math.max.apply(null, [aovMax, conversionMax, rpvMax]),
			absoluteMax 	= percentify(absMax, 0, false),
			roundedMax 		= setRoundedMax(absoluteMax);
			console.log(roundedMax);
			//Industry Bar Graphs
			if (dash.activeData.roi_rr_aov !== null || dash.activeData.roi_rr_conversion !== null || dash.activeData.roi_rr_revenue_per_visit !== null) {
				dash.showRRIndustryBars(true);
				//Remap Values
				dash.rrAovIndustry(remapValue((dash.activeData.roi_rr_aov * 100), 0, roundedMax, 0, 282)),
				dash.rrConversionIndustry(remapValue((dash.activeData.roi_rr_conversion * 100), 0, roundedMax, 0, 282)),
				dash.rrRpvIndustry(remapValue((dash.activeData.roi_rr_revenue_per_visit * 100), 0, roundedMax, 0, 282));
				//Show Industry Labels
				dash.rrAovIndustryPercent(percentify(dash.activeData.roi_rr_aov, 0 , true)),
				dash.rrConversionIndustryPercent(percentify(dash.activeData.roi_rr_conversion, 0 , true)),
				dash.rrRpvIndustryPercent(percentify(dash.activeData.roi_rr_revenue_per_visit, 0 , true));
			};
			//Vertical Bar Graphs
			dash.rrAovAll(remapValue((dash.data.roi_rr_aov * 100), 0, roundedMax, 0, 282)),
			dash.rrConversionAll(remapValue((dash.data.roi_rr_conversion * 100), 0, roundedMax, 0, 282)),
			dash.rrRpvAll(remapValue((dash.data.roi_rr_revenue_per_visit * 100), 0, roundedMax, 0, 282));

			//Bar Percentage Text
			dash.rrAovAllPercent(percentify(dash.data.roi_rr_aov, 0 , true)),
			dash.rrConversionAllPercent(percentify(dash.data.roi_rr_conversion, 0 , true)),
			dash.rrRpvAllPercent(percentify(dash.data.roi_rr_revenue_per_visit, 0 , true));

			//Set Max & Mid Marker Values (Min Will be 0)
			dash.rrMax(roundedMax),
			dash.rrMid(roundedMax/2),
			dash.rrMin(0);

	};

	//Renders Questions & Answers Data Module
	Dashboard.prototype.renderQAModule 					= function () {
		var dash = this;
			dash.qaAovAll(percentify(dash.data.roi_qa_lift_aov, 0 , true)),
			dash.qaConversionAll(percentify(dash.data.roi_qa_lift_conversion, 0 , true)),
			dash.qaRpvAll(percentify(dash.data.roi_qa_lift_revenue_per_visit, 0 , true));
	};

	//Renders Average Ratings Data Module
	Dashboard.prototype.renderARModule 					= function () {
		var dash = this;
			dash.arIndustry(dash.activeData.average_rating),
			dash.arAll(dash.data.average_rating);
	};

	//Renders Ratings Distribution Data Module
	Dashboard.prototype.renderRDModule 					= function () {
		var dash = this;

			//Bar Graphs
			dash.rd5(dash.activeData.rating_distribution_5 * 466),
			dash.rd4(dash.activeData.rating_distribution_4 * 466),
			dash.rd3(dash.activeData.rating_distribution_3 * 466),
			dash.rd2(dash.activeData.rating_distribution_2 * 466),
			dash.rd1(dash.activeData.rating_distribution_1 * 466),
			//Percent Text
			dash.rd5Text(percentify(dash.activeData.rating_distribution_5, 0 , true)),
			dash.rd4Text(percentify(dash.activeData.rating_distribution_4, 0 , true)),
			dash.rd3Text(percentify(dash.activeData.rating_distribution_3, 0 , true)),
			dash.rd2Text(percentify(dash.activeData.rating_distribution_2, 0 , true)),
			dash.rd1Text(percentify(dash.activeData.rating_distribution_1, 0 , true));
	};

	//Instantiate, Initialize, Apply Bindings
	var dashboard = new Dashboard();
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