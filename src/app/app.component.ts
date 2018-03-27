import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import * as $ from "jquery";
import { YoutubeApiService } from './youtube-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  initialTab = {};
  tabNumber = 1;
  initialPage = {};
  initialSearchBtn = {};

  constructor(private youtubeService: YoutubeApiService) { }

  ngOnInit() {
    this.initialTab = $(".tab").last();
    this.initialPage = $(".page").last();
    this.initialSearchBtn = $(".search-button");
    $('.search-button').attr('disabled', false);
  }

  closeTab(event) {
    let target = $(event.target || event.srcElement || event.currentTarget);
    let tabToClose = target.parentsUntil(".tabs-wrap", ".tab");
    let tabToCloseId = tabToClose.attr("id");
    const INDEX_TO_SLICE = 4;
    let tabNumberToClose = tabToCloseId.slice(INDEX_TO_SLICE);

    if (tabToClose.prev(".tab").length > 0) { //if there is a previous tab
      let prevTab = tabToClose.prev(".tab");
      prevTab.addClass("active");

      let currentPage = $("#content-wrap").find(".page.active");
      var newActivePage = currentPage.prev(".page").addClass("active");
    } else {
      let nextTab = tabToClose.next(".tab");
      nextTab.addClass("active");

      let currentPage = $("#content-wrap").find(".page.active");
      var newActivePage = currentPage.next(".page").addClass("active");
    }

    tabToClose.remove();
    let pageToClose = $("#content-wrap").find("#page-" + tabNumberToClose);
    pageToClose.remove();
  }

  newTab() {
    this.cloneTab();
    this.clonePage();
  }

  cloneTab() {
    let initTab = $(this.initialTab).addClass("active");
    let initTabId = initTab.attr("id");

    //increment the tab ID
    this.tabNumber += 1;
    let newTabId = this.incrementId(initTabId);

    let newTab = initTab.clone(true, true);
    newTab.attr("id", newTabId);
    newTab.find(".tab-name").text(newTabId);

    //click event for the tab
    let initSearchBtn = $(this.initialSearchBtn);
    newTab.on("click", function (event) {
      let target = $(event.target || event.srcElement || event.currentTarget);
      if (!target.hasClass("btn-close")) {
        let currentTab = target.parentsUntil(".tabs-wrap", ".tab");
        let currentTabId = currentTab.attr("id");
        const INDEX_TO_SLICE = 4;
        let currentTabNumber = currentTabId.slice(INDEX_TO_SLICE);
        $("#tabs-wrap").find(".tab.active").removeClass("active");
        currentTab.addClass("active");

        //current page active
        let currentPage = $("#content-wrap").find("#page-" + currentTabNumber);
        $("#content-wrap").find(".page.active").removeClass("active");
        currentPage.addClass("active");
        let currentPageInput = currentPage.find(".input-query");
        initSearchBtn.insertAfter(currentPageInput);
      }
    });

    let closeBtn = newTab.find(".btn-close");

    //close tab event
    closeBtn.on("click", function (event) {
      let target = $(event.target || event.srcElement || event.currentTarget);
      let tabToClose = target.parentsUntil(".tabs-wrap", ".tab");
      let tabToCloseId = tabToClose.attr("id");
      const INDEX_TO_SLICE = 4;
      let tabToCloseNumber = tabToCloseId.slice(INDEX_TO_SLICE);

      //make the previous tab active if we want to close the active one
      if (tabToClose.hasClass("active")) {

        if (tabToClose.prev(".tab").length > 0) { //if there is a previous tab
          let prevTab = tabToClose.prev(".tab");
          prevTab.addClass("active");

          let currentPage = $("#content-wrap").find(".page.active");
          var newActivePage = currentPage.prev(".page").addClass("active");
        } else {
          let nextTab = tabToClose.next(".tab");
          nextTab.addClass("active");

          let currentPage = $("#content-wrap").find(".page.active");
          var newActivePage = currentPage.next(".page").addClass("active");
        }


        let newPageInput = newActivePage.find(".input-query");
        initSearchBtn.insertAfter(newPageInput);
      }

      tabToClose.remove();
      let pageToClose = $("#content-wrap").find("#page-" + tabToCloseNumber);
      pageToClose.remove();
    });

    $("#tabs-wrap").find(".tab.active").removeClass("active");

    newTab.insertBefore($("#newTabWrap"));
  }

  clonePage() {
    let initPage = $(this.initialPage).addClass("active");
    let initSearchBtn = $(this.initialSearchBtn);

    let initPageId = initPage.attr("id");
    let initPageInputId = initPage.find(".input-query").attr("id");
    let initPageResultContainerId = initPage.find(".result-wrap").attr("id");
    initPage.find(".search-button").remove();

    let newPageId = this.incrementId(initPageId);
    let newPageInputId = this.incrementId(initPageInputId);
    let newPageResultContainerId = this.incrementId(initPageResultContainerId);


    let newPage = initPage.clone(true, true);

    //change ids to elements of the newPage
    newPage.attr("id", newPageId);
    let newPageInput = newPage.find(".input-query");
    newPageInput.attr("id", newPageInputId).val("");
    let newPageResultContainer = newPage.find(".result-wrap");
    newPageResultContainer.attr("id", newPageResultContainerId);

    newPage.find(".video-list").remove();

    //add search button with event binding
    initSearchBtn.insertAfter(newPageInput);

    $("#content-wrap").find(".page.active").removeClass("active");
    $("#content-wrap").append(newPage);
  }

  incrementId(initialId) {
    return initialId.trim().replace(/\d+/, (this.tabNumber).toString());
  }

  makeTabActive(event) {
    let target = $(event.target || event.srcElement || event.currentTarget);
    if (!target.hasClass("btn-close")) {
      let currentTab = target.parentsUntil(".tabs-wrap", ".tab");
      let currentTabId = currentTab.attr("id");
      const INDEX_TO_SLICE = 4;
      let currentTabNumber = currentTabId.slice(INDEX_TO_SLICE);
      $("#tabs-wrap").find(".tab.active").removeClass("active");
      currentTab.addClass("active");

      //current page active
      let currentPage = $("#content-wrap").find("#page-" + currentTabNumber);
      $("#content-wrap").find(".page.active").removeClass("active");
      currentPage.addClass("active");

      let initSearchBtn = $(this.initialSearchBtn);
      let currentPageInput = currentPage.find(".input-query");
      initSearchBtn.insertAfter(currentPageInput);
    }
  }

  search(event) {
    let target = $(event.target || event.srcElement || event.currentTarget);
    let pageToDisplay = target.parentsUntil(".content-wrap", ".page");
    let currentInputField = target.prev(".input-query");
    let queryString = currentInputField.val();

    let currentResultContainer = pageToDisplay.find(".result-wrap");
    this.youtubeService.search(queryString)
      .subscribe(resultList => {
        this.appendResultList(resultList, currentResultContainer);
      });
  }

  appendResultList(resultItems, container) {
    const INDEX_TO_SLICE = 11;
    let containerNumber = container.attr("id").slice(INDEX_TO_SLICE); //get number from container`s ID
    $("#videos" + containerNumber).remove();
    let unorderedList = $("<ul></ul>").attr("id", "videos" + containerNumber)
      .addClass("video-list");

    let row;
    for (let i = 0; i < resultItems.length; i += 1) {
      if ((i + 1) % 3 === 1) { //new row on every 3 elements
        row = $("<div></div>").addClass("row");
        unorderedList.append(row);
      }
      let videoThumbnail = resultItems[i].snippet.thumbnails.high.url;
      let videoTitle = resultItems[i].snippet.title;

      let video = $("<div></div>").addClass("video col col-4");
      let imgWrap = $("<div></div>").addClass("thumb-wrap");
      let imgLink = $("<a></a>");
      let img = $("<img/>").attr("src", videoThumbnail).addClass("video-thumb");
      let titleWrap = $("<div></div>").addClass("video-title-wrap");
      let title = $("<h5></h5>").text(videoTitle);
      imgLink.append(img);
      imgWrap.append(imgLink);
      video.append(imgWrap);
      titleWrap.append(title);
      titleWrap.insertAfter(imgWrap);
      row.append(video);
    }

    //single browser redraw
    container.append(unorderedList);
  }
}
