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

  constructor(private youtubeService: YoutubeApiService) {}

  ngOnInit() {
    this.initialTab = $(".tab").last();
    $('#search-button').attr('disabled', false);
  }

  closeTab(event) {
    let target = $(event.target || event.srcElement || event.currentTarget);
    let tabToClose = target.parentsUntil(".tabs-wrap", ".tab");
    tabToClose.remove();
  }

  newTab() {
    let lastTab = ($(".tab").length !== 0 ? $(".tab").last() : this.initialTab);
    let lastTabName = lastTab.find(".tab-name").text();
    this.tabNumber += 1;
    let newTabName = lastTabName.trim().replace(/\d+/, (this.tabNumber).toString());

    let newTab = lastTab.clone(true, true);
    newTab.find(".tab-name").text(newTabName);
    let closeBtn = newTab.find(".btn-close");
    closeBtn.on("click", function (event) {
      let target = $(event.target || event.srcElement || event.currentTarget);
      let tabToClose = target.parentsUntil(".tabs-wrap", ".tab");
      tabToClose.remove();
    });

    newTab.insertBefore($("#newTabWrap"));
  }

  search() {
    let queryString = $('#query').val();

    $("#result-wrap").remove("#videos");
    this.youtubeService.search(queryString)
      .subscribe(resultList => {
        this.appendResultList(resultList);
      });
    
  }

  appendResultList(resultItems: Array<any>) {
    $("#videos").remove();
    let unorderedList = $("<ul></ul>").attr("id", "videos");

    let row;
    for(let i=0; i<resultItems.length; i+=1){
      if((i+1)%3===1){
        row = $("<div></div>").addClass("row");
        unorderedList.append(row);
      }
      let videoThumbnail = resultItems[i].snippet.thumbnails.medium.url;
      let videoTitle = resultItems[i].snippet.title;

      let video = $("<div></div>").addClass("video col col-4");
      let imgLink = $("<a></a>");
      let img = $("<img/>").attr("src", videoThumbnail);
      let title = $("<h5></h5>").text(videoTitle);
      imgLink.append(img);
      video.append(imgLink);
      title.insertAfter(imgLink);
      row.append(video);
    }

    $("#result-wrap").append(unorderedList);
  }
}
