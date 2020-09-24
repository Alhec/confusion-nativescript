import { Component, OnInit, Inject } from '@angular/core';
import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';

@Component({
    selector: 'app-home',
    moduleId: module.id,
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

    leaders: Leader[];
    errMess: string;

    text1="Started in 2010, Ristorante con Fusion quickly established itself as a culinary icon par excellence in Hong Kong. With its unique brand of world fusion cuisine that can be found nowhere else, it enjoys patronage from the A-list clientele in Hong Kong.  Featuring four of the best three-star Michelin chefs in the world, you never know what will arrive on your plate the next time you visit us."
    text2="The restaurant traces its humble beginnings to The Frying Pan, a successful chain started by our CEO, Mr. Peter Pan, that featured for the first time the world's best cuisines in a pan."
    constructor(
        private leaderservice: LeaderService,
        @Inject('baseURL') private baseURL) { }

    ngOnInit() {
        this.leaderservice.getLeaders()
        .subscribe(leader => this.leaders = leader,
            errmess => this.errMess = <any>errmess);
    }

}