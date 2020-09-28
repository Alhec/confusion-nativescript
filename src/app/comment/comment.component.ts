import { Component, OnInit, Inject } from '@angular/core';
import { ModalDialogParams } from '@nativescript/angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
	moduleId: module.id,
	templateUrl: './comment.component.html'
})
export class CommentComponent implements OnInit {

	commentForm: FormGroup;

	constructor(private params: ModalDialogParams,
				private formBuilder: FormBuilder) {
		this.commentForm = this.formBuilder.group({
			author: '',
			rating: 3,
			comment: ''
		});
	}

	ngOnInit() {
	}

	public submit() {
        let date = new Date()
        this.commentForm.value['date']=date.toISOString()
		this.params.closeCallback(this.commentForm.value);
	}
}