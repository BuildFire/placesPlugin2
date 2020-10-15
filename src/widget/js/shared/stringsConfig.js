const stringsConfig = {
  entityDetails: {
		title: "Entity Details"
		, subtitle: ""
		, labels: {
			entity: {
				title: "Entity Name"
				, defaultValue: "Entity"
				, maxLength: 50
      }
			, proccessed: {
				title: "Proccessed"
				, defaultValue: "Proccessed"
				, maxLength: 50
      }
			, reviewer: {
				title: "Reviewer Title"
				, defaultValue: "Reviewer"
				, maxLength: 20
      }
      , additionalStatusOnTitle: {
				title: "Approved"
				, defaultValue: "Approved"
				, maxLength: 50
			}
      , additionalStatusOffTitle: {
				title: "Rejected"
				, defaultValue: "Rejected"
				, maxLength: 50
      }
		}
  },
  pushNotifications: {
		title: "Push Notifications"
		, subtitle: ""
		, labels: {
      pushNotificationTitleOnSubmission: {
				title: "Push Notification 1: New Submission - Title"
				, defaultValue: "New Submission"
				, maxLength: 50
      }
      , pushNotificationMessageOnSubmission: {
				title: "Push Notification 1: New Submission - Message"
				, defaultValue: "A new submission has been created!"
				, maxLength: 100
      }
      , pushNotificationTitleOnReview: {
				title: "Push Notification 2: Submission Reviewed - Title"
				, defaultValue: "Submission Reviewed"
				, maxLength: 50
      }
      , pushNotificationMessageOnReview: {
				title: "Push Notification 2: Submission Reviewed - Message"
				, defaultValue: "Your submission has been reviewed!"
				, maxLength: 100
			}
		}
	}
};
