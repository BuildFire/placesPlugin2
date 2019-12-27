
const searchTableConfig = {
	options: {
		showEditButton: true
		, showDeleteButton: true
	}
	, columns: [
		{
			header: "Name"
			, data: "${data.name.firstName} ${data.name.lastName}"
			, type: "string"
			, width: "150px"
		}
		, {
			header: "e-mail"
			, data: "${data.email}"
			, type: "string"
			, width: "150px"
		}
		, {
			header: "Credits"
			, data: "${data.credits}"
			, type: "number"
			, width: "50px"
		}
		, {
			header: "Created On"
			, data: "${ new Date(data.createdOn).toLocaleDateString()  }"
			, type: "date"
			, width: "100px"
		}
	]

};