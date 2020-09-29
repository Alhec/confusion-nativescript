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
import { Page } from "@nativescript/core/ui/page";
import { Animation, AnimationDefinition } from "@nativescript/core/ui/animation";
import { View } from "@nativescript/core/ui/core/view";
import { SwipeGestureEventData, SwipeDirection } from "@nativescript/core/ui/gestures";
import { Color } from '@nativescript/core/color';
import * as enums from "@nativescript/core/ui/enums";
import * as SocialShare from "nativescript-social-share";
import { ImageSource, fromUrl } from "@nativescript/core/image-source";
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
    showComments: boolean = false;

    cardImage: View;
    commentList: View;
    cardLayout: View;

    constructor(private dishservice: DishService,
        private route: ActivatedRoute,
        private routerExtensions: RouterExtensions,
        @Inject('baseURL') private baseURL,
        private favoriteservice: FavoriteService,
        private fonticon: TNSFontIconService,
        private vcRef: ViewContainerRef,
        private modalService: ModalDialogService,
        private page: Page,
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
		    actions: ["Add to Favourites", "Add a Comment","Social Sharing"]
		}).then(result => {
		    console.log("Dialog result: " + result);
		    if(result == "Add to Favourites"){
		        this.addToFavorites();
		    }else if(result == "Add a Comment"){
		        this.addAComment();
		    }else if (result === 'Social Sharing') {
                this.socialShare();
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

        onSwipe(args: SwipeGestureEventData) {

            if (this.dish) {
                this.cardImage = <View>this.page.getViewById<View>("cardImage");
                this.cardLayout = <View>this.page.getViewById<View>("cardLayout");
                this.commentList = <View>this.page.getViewById<View>("commentList");

                if (args.direction === SwipeDirection.up && !this.showComments ) {
                    this.animateUp();
                }
                else if (args.direction === SwipeDirection.down && this.showComments ) {
                    this.showComments = false;
                    this.animateDown();
                }
                }

            }

            showAndHideComments() {
                this.cardImage = <View>this.page.getViewById<View>("cardImage");
                this.cardLayout = <View>this.page.getViewById<View>("cardLayout");
                this.commentList = <View>this.page.getViewById<View>("commentList");

                if (!this.showComments ) {
                    this.animateUp();
                }
                else if (this.showComments ) {
                    this.showComments = false;
                    this.animateDown();
                }
            }

            animateUp() {
                let definitions = new Array<AnimationDefinition>();
                let a1: AnimationDefinition = {
                    target: this.cardImage,
                    scale: { x: 1, y: 0 },
                    translate: { x: 0, y: -200 },
                    opacity: 0,
                    duration: 500,
                    curve: enums.AnimationCurve.easeIn
                };
                definitions.push(a1);

                let a2: AnimationDefinition = {
                    target: this.cardLayout,
                    backgroundColor: new Color("#ffc107"),
                    duration: 500,
                    curve: enums.AnimationCurve.easeIn
                };
                definitions.push(a2);

                let animationSet = new Animation(definitions);

                animationSet.play().then(() => {
                this.showComments = true;
                })
                .catch((e) => {
                    console.log(e.message);
                });
            }

            animateDown() {
                let definitions = new Array<AnimationDefinition>();
                let a1: AnimationDefinition = {
                    target: this.cardImage,
                    scale: { x: 1, y: 1 },
                    translate: { x: 0, y: 0 },
                    opacity: 1,
                    duration: 500,
                    curve: enums.AnimationCurve.easeIn
                };
                definitions.push(a1);

                let a2: AnimationDefinition = {
                    target: this.cardLayout,
                    backgroundColor: new Color("#ffffff"),
                    duration: 500,
                    curve: enums.AnimationCurve.easeIn
                };
                definitions.push(a2);

                let animationSet = new Animation(definitions);

                animationSet.play().then(() => {
                })
                .catch((e) => {
                    console.log(e.message);
                });
            }

            socialShare() {
                let image: ImageSource;

                    fromUrl(this.baseURL + this.dish.image)
                    .then((img: ImageSource) => {
                    image = img;
                        SocialShare.shareImage(image, "How would you like to share this image?")
                    })
                    .catch(()=> { console.log('Error loading image'); });
                }
}