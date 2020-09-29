import { Component, OnInit, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { TextField } from '@nativescript/core/ui/text-field';
import { Switch } from '@nativescript/core/ui/switch';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import { ModalDialogService, ModalDialogOptions } from "@nativescript/angular";
import { ReservationModalComponent } from "../reservationmodal/reservationmodal.component";
import { View } from '@nativescript/core/ui/core/view';
import { Page } from '@nativescript/core/ui/page';
import { Animation, AnimationDefinition } from '@nativescript/core/ui/animation';
import { SwipeGestureEventData, SwipeDirection } from '@nativescript/core/ui/gestures';
import { Color } from '@nativescript/core/color';
import * as enums from '@nativescript/core/ui/enums';
import { CouchbaseService } from '../services/couchbase.service';
@Component({
    selector: 'app-reservation',
    moduleId: module.id,
    templateUrl: './reservation.component.html',
    styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

    reservation: FormGroup;
    dValues: boolean = false;
	docId: string = "reservations";
	rValues = null;
	reserveForm: View;
	reservationV: View;
    constructor(private formBuilder: FormBuilder,
        private modalService: ModalDialogService,
        private vcRef: ViewContainerRef,
        private couchbaseservice: CouchbaseService,
		private page: Page,
		) {

            this.reservation = this.formBuilder.group({
                guests: 3,
                smoking: false,
                dateTime: ['', Validators.required]
            });
            let doc = this.couchbaseservice.getDocument(this.docId);
                if (doc == null) {
                    this.couchbaseservice.createDocument({"reservations": []}, this.docId);
                }
    }

    ngOnInit() {

    }

    onSmokingChecked(args) {
        let smokingSwitch = <Switch>args.object;
        if (smokingSwitch.checked) {
            this.reservation.patchValue({ smoking: true });
        }
        else {
            this.reservation.patchValue({ smoking: false });
        }
    }

    onGuestChange(args) {
        let textField = <TextField>args.object;

        this.reservation.patchValue({ guests: textField.text});
    }

    onDateTimeChange(args) {
        let textField = <TextField>args.object;

        this.reservation.patchValue({ dateTime: textField.text});
    }

    onSubmit() {
        console.log("first reservation");
		console.log(JSON.stringify(this.reservation.value));
		this.reserveForm = this.page.getViewById<View>("reserveForm");
		let aDef = new Array<AnimationDefinition>();

		let a1: AnimationDefinition = {
			target: this.reserveForm,
			scale: {x: 0, y: 0},
			translate: {x: 0, y: -200},
			opacity: 0,
			duration: 500,
			curve: enums.AnimationCurve.easeInOut
		};
		aDef.push(a1);

		let animationSet = new Animation(aDef);
		animationSet.play()
			.then(() => {
				this.rValues = this.reservation.value;

				let definitions = new Array<AnimationDefinition>();
				let a1: AnimationDefinition = {
					target: this.reserveForm,
					scale: {x: 1, y: 1},
					translate: {x: 0, y: 0},
					opacity: 1,
					duration: 500,
					curve: enums.AnimationCurve.easeInOut
				};
				definitions.push(a1);

				let animationSet = new Animation(definitions);
				animationSet.play()
					.then(() => {
						this.couchbaseservice.updateDocument(this.docId, {"reservations": this.rValues});
						console.log(this.couchbaseservice.getDocument(this.docId));
					});
			})
			.catch((e) => {
				console.log(e.message)
			});
    }

    createModalView(args) {

        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: args,
            fullscreen: false
        };

        this.modalService.showModal(ReservationModalComponent, options)
            .then((result: any) => {
                if (args === "guest") {
                    this.reservation.patchValue({guests: result});
                }
                else if (args === "date-time") {
                    this.reservation.patchValue({ dateTime: result});
                }
            });
    }
}