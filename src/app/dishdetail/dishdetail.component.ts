import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DishService } from '../services/dish.service';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { RouterExtensions } from '@nativescript/angular';
import { FavoriteService } from '../services/favorite.service';
import { TNSFontIconService } from 'nativescript-ngx-fonticon';
import { ToastDuration, ToastPosition, Toasty } from 'nativescript-toasty';
import * as dialogs from "@nativescript/core/ui/dialogs";
import { ModalDialogService, ModalDialogOptions } from '@nativescript/angular';
import { CommentComponent } from '../comment/comment.component';

@Component({
    selector: 'app-dishdetail',
        moduleId: module.id,
    templateUrl: './dishdetail.component.html',
    styleUrls: ['./dishdetail.component.css']
})
export class DishdetailComponent implements OnInit {

    dish: Dish;
    comment: Comment;
    errMess: string;
    avgstars: string;
    numcomments: number;
    favorite: boolean = false;
    dialogs = require("tns-core-modules/ui/dialogs");

    constructor(private dishservice: DishService,
        private route: ActivatedRoute,
        private routerExtensions: RouterExtensions,
        @Inject('baseURL') private baseURL,
        private favoriteservice: FavoriteService,
        private fonticon: TNSFontIconService,
        private vcRef: ViewContainerRef,
        private modalService: ModalDialogService,
        ) { }

        ngOnInit() {

                this.route.params
                .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
                .subscribe(dish => {
                    this.dish = dish;
                    this.favorite = this.favoriteservice.isFavorite(this.dish.id.toString());
                    this.numcomments = this.dish.comments.length;

                    let total = 0;
                    this.dish.comments.forEach(comment => total += comment.rating);
                    this.avgstars = (total/this.numcomments).toFixed(2);
                    },
                    errmess => { this.dish = null; this.errMess = <any>errmess; });
            }


    goBack(): void {
        this.routerExtensions.back();
    }

    onDialog() {
		dialogs.action({
		    message: "Select an option",
		    cancelButtonText: "Cancel",
		    actions: ["Add to Favourites", "Add a Comment"]
		}).then(result => {
		    console.log("Dialog result: " + result);
		    if(result == "Add to Favourites"){
		        this.addToFavorites();
		    }else if(result == "Add a Comment"){
		        this.addAComment();
		    }
		});
    }

    addAComment() {
		let options: ModalDialogOptions = {
			viewContainerRef: this.vcRef,
            fullscreen: true
		};

		this.modalService.showModal(CommentComponent, options)
			.then((comment: Comment) => {
				const date = new Date();
				this.dish.comments.push({
					author: comment.author,
					rating: comment.rating,
					comment: comment.comment,
					date: comment.date
				})
			});
	}
    addToFavorites() {
        if (!this.favorite) {
            console.log('Adding to Favorites', this.dish.id);
            this.favorite = this.favoriteservice.addFavorite(this.dish.id.toString());
            const toast = new Toasty({text:"Added Dish "+ this.dish.id})
                .setToastDuration(ToastDuration.SHORT)
                .setToastPosition(ToastPosition.BOTTOM);
            toast.show();
            }
        }

}