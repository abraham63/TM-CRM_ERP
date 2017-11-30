/**
Copyright 2017 ToManage

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

@author    ToManage SAS <contact@tomanage.fr>
@copyright 2014-2017 ToManage SAS
@license   http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
International Registered Trademark & Property of ToManage SAS
*/



"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
		moment = require('moment'),
		async = require('async'),
		Schema = mongoose.Schema,
		ObjectId = mongoose.Schema.Types.ObjectId,
		timestamps = require('mongoose-timestamp');

var DataTable = require('mongoose-datatable');
DataTable.configure({
		verbose: false,
		debug: false
});
mongoose.plugin(DataTable.init);

var Dict = INCLUDE('dict');

var setPrice = MODULE('utils').setPrice;
var setDate = MODULE('utils').setDate;
const round = MODULE('utils').round;

/**
 * Invoice Schema
 */
var billSchema = new Schema({
		// true client false fournisseur
		forSales: {
				type: Boolean,
				default: true
		},
		ref: {
				type: String,
				index: true
		},
		isremoved: Boolean,
		ID: {
				type: Number
		},
		/*title: {//For internal use only
		 ref: String,
		 autoGenerated: {type: Boolean, default: false} //For automatic process generated bills
		 },*/
		currency: {
				_id: {
						type: String,
						ref: 'currency',
						default: ''
				},
				rate: {
						type: Number,
						default: 1
				} // changed default to '0' for catching errors
		},
		Status: {
				type: String,
				default: 'DRAFT'
		},
		cond_reglement_code: {
				type: String,
				default: 'RECEP'
		},
		mode_reglement_code: {
				type: String,
				default: 'TIP'
		},
		bank_reglement: {
				type: ObjectId,
				ref: 'bank'
		},
		//availability_code: {type: String, default: 'AV_NOW'},
		type: {
				type: String,
				default: 'SRC_COMM'
		},
		supplier: {
				type: Schema.Types.ObjectId,
				ref: 'Customers',
				require: true
		},
		contacts: [{
				type: Schema.Types.ObjectId,
				ref: 'Customers'
		}],
		ref_client: {
				type: String,
				default: ""
		},

		imported: {
				type: Boolean,
				default: false
		}, //imported in accounting
		journalId: [Schema.Types.ObjectId], // Id transactions for accounting

		orders: [{
				type: Schema.Types.ObjectId,
				ref: 'order'
		}],

		datec: {
				type: Date,
				default: new Date,
				set: setDate
		},
		dater: {
				type: Date,
				set: setDate
		}, // date limit reglement
		dateOf: {
				type: Date
		}, // Periode de facturation du
		dateTo: {
				type: Date
		}, // au
		notes: [{
				title: String,
				note: String,
				public: {
						type: Boolean,
						default: false
				},
				edit: {
						type: Boolean,
						default: false
				}
		}],
		privateNotes: [{
				title: String,
				note: String,
				public: {
						type: Boolean,
						default: false
				},
				edit: {
						type: Boolean,
						default: false
				}
		}],
		discount: {
				escompte: {
						percent: {
								type: Number,
								default: 0
						},
						value: {
								type: Number,
								default: 0,
								set: setPrice
						} // total remise globale
				},
				discount: {
						percent: {
								type: Number,
								default: 0
						}, //discount
						value: {
								type: Number,
								default: 0,
								set: setPrice
						} // total remise globale
				}
		},
		total_ht: {
				type: Number,
				default: 0,
				set: setPrice
		},
		correction: {
				type: Number,
				default: 0,
				set: setPrice
		},
		total_taxes: [{
				_id: false,
				taxeId: {
						type: Schema.Types.ObjectId,
						ref: 'taxes'
				},
				value: {
						type: Number,
						default: 0
				}
		}],
		total_ttc: {
				type: Number,
				default: 0,
				set: setPrice
		},
		total_paid: {
				type: Number,
				default: 0,
				set: setPrice
		},
		shipping: {
				total_ht: {
						type: Number,
						default: 0,
						set: setPrice
				},
				total_taxes: [{
						_id: false,
						taxeId: {
								type: Schema.Types.ObjectId,
								ref: 'taxes'
						},
						value: {
								type: Number,
								default: 0
						}
				}],
				/*total_ttc: {
				    type: Number,
				    default: 0
				}*/
		},
		createdBy: {
				type: ObjectId,
				ref: 'Users'
		},
		editedBy: {
				type: ObjectId,
				ref: 'Users'
		},
		salesPerson: {
				type: ObjectId,
				ref: 'Employees'
		}, //commercial_id
		salesTeam: {
				type: ObjectId,
				ref: 'Department'
		},
		entity: String,
		optional: Schema.Types.Mixed,
		delivery_mode: {
				type: String,
				default: "Comptoir"
		},
		billing: {
				type: Schema.Types.ObjectId,
				ref: 'Customers'
		},
		//costList: { type: ObjectId, ref: 'priceList', default: null }, //Not used
		//priceList: { type: ObjectId, ref: 'priceList', default: null },

		address: {
				name: {
						type: String,
						default: ''
				},
				street: {
						type: String,
						default: ''
				},
				city: {
						type: String,
						default: ''
				},
				state: {
						type: String,
						default: ''
				},
				zip: {
						type: String,
						default: ''
				},
				country: {
						type: String,
						ref: 'countries',
						default: 'FR'
				},
				contact: {
						name: {
								type: String,
								default: ''
						},
						phone: {
								type: String,
								set: MODULE('utils').setPhone,
								default: ''
						},
						mobile: {
								type: String,
								set: MODULE('utils').setPhone,
								default: ''
						},
						fax: {
								type: String,
								set: MODULE('utils').setPhone,
								default: ''
						},
						email: {
								type: String,
								lowercase: true,
								trim: true,
								index: true
						}
				}
		},
		weight: {
				type: Number,
				default: 0
		}, // Poids total
		lines: [{
				_id: false,
				//pu: {type: Number, default: 0},
				type: {
						type: String,
						default: 'product'
				}, //Used for subtotal
				refProductSupplier: String, //Only for an order Supplier
				qty: {
						type: Number,
						default: 0
				},
				/*taxes: [{
				    _id: false,
				    taxeId: { type: Schema.Types.ObjectId, ref: 'taxes' },
				    value: { type: Number }
				}],*/
				//price_base_type: String,
				//title: String,
				priceSpecific: {
						type: Boolean,
						default: false
				},
				pu_ht: {
						type: Number,
						default: 0
				},
				description: String,
				private: String, // Private note
				product_type: String,
				product: {
						type: Schema.Types.ObjectId,
						ref: "product"
				},
				total_taxes: [{
						_id: false,
						taxeId: {
								type: Schema.Types.ObjectId,
								ref: 'taxes'
						},
						value: {
								type: Number
						}
				}],
				/*total_ttc: {
				    type: Number,
				    default: 0
				},*/
				discount: {
						type: Number,
						default: 0
				},
				total_ht: {
						type: Number,
						default: 0,
						set: setPrice
				},
				//weight: { type: Number, default: 0 },
				optional: {
						type: Schema.Types.Mixed
				}
		}],
		history: [{
				date: {
						type: Date,
						default: Date.now
				},
				author: {
						type: ObjectId,
						ref: 'Users'
				},
				mode: String, //email, order, alert, new, ...
				Status: String,
				msg: String
		}],

		whoCanRW: {
				type: String,
				enum: ['owner', 'group', 'everyOne'],
				default: 'everyOne'
		},
		groups: {
				owner: {
						type: ObjectId,
						ref: 'Users',
						default: null
				},
				users: [{
						type: ObjectId,
						ref: 'Users',
						default: null
				}],
				group: [{
						type: ObjectId,
						ref: 'Department',
						default: null
				}]
		},

		project: {
				type: ObjectId,
				ref: 'Project',
				default: null
		},

		//feeBilling: { type: Boolean, default: true }, // Frais de facturation
		oldId: String // Only for import migration
}, {
		toObject: {
				virtuals: true
		},
		toJSON: {
				virtuals: true
		}
});

billSchema.plugin(timestamps);

// Gets listing
billSchema.statics.query = function(options, callback) {
		const self = this;

		var data = options.query;
		var quickSearch = data.quickSearch;
		const limit = options.limit;
		const skip = options.skip;

		const FilterMapper = MODULE('helper').filterMapper;
		var filterMapper = new FilterMapper();

		var accessRollSearcher;
		var contentSearcher;
		var waterfallTasks;
		var contentType = data.contentType;
		var sort = {};
		var filter = data.filter && JSON.parse(data.filter) || {};
		var key;

		var filterObject = {
				isremoved: {
						$ne: true
				},
				forSales: (options.query.forSales == 'false' ? false : true)
		};
		var optionsObject = {};
		var matchObject = {};
		var regExp;
		var pastDue = filter.pastDue;

		if (quickSearch) {
				regExp = new RegExp(quickSearch, 'ig');
				matchObject['ref'] = {
						$regex: regExp
				};
				filter = {};
		}

		if (filter && filter.salesPerson && filter.salesPerson.value.length)
				filter.Status.value = [];
		if (filter && filter.supplier && filter.supplier.value.length)
				filter.Status.value = [];


		//TODO refresh Status on angular
		if (filter && filter.Status && filter.Status.value[0])
				switch (filter.Status.value[0]) {
						case 'LIST':
								filter.Status.value = [];
								filterObject.Status = {
										$ne: "PAID"
								};
								break;
						case 'VALIDATE':
								filter.Status.value = [];
								filterObject.Status = 'NOT_PAID';
								filterObject.dater = {
										$gt: moment().subtract(10, 'days').toDate()
								};
								break;
						case 'NOT_PAID':
								filter.Status.value = [];
								filterObject.Status = 'NOT_PAID';
								filterObject.dater = {
										$lte: moment().subtract(10, 'days').toDate()
								};
								break;
						case 'ALL':
								filter.Status.value = [];
								break;
				}

		filterObject.$and = [];

		if (filter && typeof filter === 'object') {
				filterObject.$and.push(filterMapper.mapFilter(filter, {
						contentType: contentType
				})); // caseFilter(filter);
		}

		//return console.log(filterObject.$and[0].$and[0].$or);

		if (options.query.sort) {
				sort = JSON.parse(options.query.sort);
				sort._id = 1;
		} else
				sort = {
						datec: 1,
						_id: 1
				};

		//if (contentType !== 'order' && contentType !== 'integrationUnlinkedOrders') {
		//    Order = MODEL('order').Schema.OrderSupplier;

		//queryObject.$and.push({ _type: 'purchaseOrders' });
		//} else {
		//queryObject.$and.push({ _type: 'Order' });
		//}

		if (pastDue) {
				optionsObject.$and.push({
						expectedDate: {
								$gt: new Date(filter.date.value[1])
						}
				}, {
						'workflow.status': {
								$ne: 'Done'
						}
				});
		}

		accessRollSearcher = function(cb) {
				const accessRoll = MODULE('helper').accessRoll;

				accessRoll(options.user, self, cb);
		};

		contentSearcher = function(ids, cb) {
				var newQueryObj = {};
				const ObjectId = MODULE('utils').ObjectId;

				var salesManagerMatch = {
						$and: [{
										$eq: ['$$projectMember.projectPositionId', ObjectId("570e9a75785753b3f1d9c86e")]
								}, //CONSTANTS.SALESMANAGER
								{
										$or: [{
												$and: [{
														$eq: ['$$projectMember.startDate', null]
												}, {
														$eq: ['$$projectMember.endDate', null]
												}]
										}, {
												$and: [{
														$lte: ['$$projectMember.startDate', '$datec']
												}, {
														$eq: ['$$projectMember.endDate', null]
												}]
										}, {
												$and: [{
														$eq: ['$$projectMember.startDate', null]
												}, {
														$gte: ['$$projectMember.endDate', '$datec']
												}]
										}, {
												$and: [{
														$lte: ['$$projectMember.startDate', '$datec']
												}, {
														$gte: ['$$projectMember.endDate', '$datec']
												}]
										}]
								}
						]
				};

				newQueryObj.$and = [];
				//newQueryObj.$and.push(queryObject);
				//console.log(JSON.stringify(filterObject));
				newQueryObj.$and.push({
						_id: {
								$in: ids
						}
				});

				var late = moment().subtract(10, 'days').toDate();

				var query = [{
								$match: filterObject
						},
						{
								$project: {
										workflow: 1,
										supplier: 1,
										'currency': 1,
										payments: 1,
										salesManagers: {
												$filter: {
														input: '$projectMembers',
														as: 'projectMember',
														cond: salesManagerMatch
												}
										},
										channel: 1,
										salesPerson: 1,
										orderRows: 1,
										paymentInfo: 1,
										datec: 1,
										ref_client: 1,
										dater: 1,
										exported: {
												$size: "$journalId"
										},
										entity: 1,
										total_ttc: 1,
										total_ht: 1,
										total_paid: 1,
										Status: 1,
										ID: 1,
										ref: 1,
										status: 1,
										_type: 1,
										forSales: 1,
										createdAt: 1
								}
						},
						/*{
						                    $lookup: {
						                        from: 'projectMembers',
						                        localField: 'project',
						                        foreignField: 'projectId',
						                        as: 'projectMembers'
						                    }
						            },*/
						/*{
						                   $lookup: {
						                       from: 'Payment',
						                       localField: '_id',
						                       foreignField: 'order',
						                       as: 'payments'
						                   }
						               },*/
						{
								$lookup: {
										from: 'Customers',
										localField: 'supplier',
										foreignField: '_id',
										as: 'supplier'
								}
						},
						/*{
						                   $lookup: {
						                       from: 'workflows',
						                       localField: 'workflow',
						                       foreignField: '_id',
						                       as: 'workflow'
						                   }
						               },*/
						{
								$lookup: {
										from: 'currency',
										localField: 'currency._id',
										foreignField: '_id',
										as: 'currency._id'
								}
						},
						{
								$lookup: {
										from: 'Project',
										localField: 'project',
										foreignField: '_id',
										as: 'project'
								}
						},
						{
								$lookup: {
										from: 'Employees',
										localField: 'salesPerson',
										foreignField: '_id',
										as: 'salesPerson'
								}
						},
						/* {
						                           $lookup: {
						                               from: 'integrations',
						                               localField: 'channel',
						                               foreignField: '_id',
						                               as: 'channel'
						                           }
						                       },*/
						{
								$project: {
										workflow: {
												$arrayElemAt: ['$workflow', 0]
										},
										supplier: {
												$arrayElemAt: ['$supplier', 0]
										},
										'currency._id': {
												$arrayElemAt: ['$currency._id', 0]
										},
										payments: 1,
										'currency.rate': 1,
										salesManagers: 1,
										channel: {
												$arrayElemAt: ['$channel', 0]
										},
										salesPerson: {
												$arrayElemAt: ['$salesPerson', 0]
										},
										orderRows: 1,
										paymentInfo: 1,
										datec: 1,
										ref_client: 1,
										dater: 1,
										exported: 1,
										entity: 1,
										total_ttc: 1,
										total_ht: 1,
										total_paid: 1,
										Status: 1,
										ID: 1,
										ref: 1,
										status: 1,
										_type: 1,
										forSales: 1,
										createdAt: 1
								}
						}, {
								$project: {
										salesManager: {
												$arrayElemAt: ['$salesManagers', 0]
										},
										supplier: {
												_id: '$supplier._id',
												fullName: {
														$concat: ['$supplier.name.first', ' ', '$supplier.name.last']
												}
										},

										workflow: {
												_id: '$workflow._id',
												status: '$workflow.status',
												name: '$workflow.name'
										},

										tempWorkflow: {
												_id: '$tempWorkflow._id',
												status: '$tempWorkflow.status'
										},

										channel: {
												_id: '$channel._id',
												name: '$channel.channelName',
												type: '$channel.type'
										},

										currency: 1,
										paymentInfo: 1,
										datec: 1,
										ref_client: 1,
										dater: 1,
										exported: 1,
										entity: 1,
										total_ttc: 1,
										total_ht: 1,
										total_paid: 1,
										Status: 1,
										ID: 1,
										salesPerson: 1,
										ref: 1,
										isOrder: 1,
										proformaCounter: 1,
										payments: 1,
										status: 1,
										_type: 1,
										forSales: 1,
										createdAt: 1
								}
						}, {
								$match: matchObject
						}, {
								$lookup: {
										from: 'Employees',
										localField: 'salesManager.employeeId',
										foreignField: '_id',
										as: 'salesManager'
								}
						}, {
								$project: {
										salesPerson: {
												$ifNull: ['$salesPerson', {
														$arrayElemAt: ['$salesManager', 0]
												}]
										},
										workflow: 1,
										tempWorkflow: 1,
										supplier: 1,
										currency: 1,
										paymentInfo: 1,
										datec: 1,
										ref_client: 1,
										dater: 1,
										exported: 1,
										entity: 1,
										total_ttc: 1,
										total_ht: 1,
										total_paid: 1,
										Status: 1,
										ID: 1,
										payments: 1,
										ref: 1,
										status: 1,
										_type: 1,
										forSales: 1,
										channel: 1,
										createdAt: 1
								}
						}, {
								$project: {
										salesPerson: {
												_id: '$salesPerson._id',
												fullName: {
														$concat: ['$salesPerson.name.first', ' ', '$salesPerson.name.last']
												}
										},
										workflow: 1,
										tempWorkflow: 1,
										supplier: 1,
										currency: 1,
										paymentInfo: 1,
										datec: 1,
										ref_client: 1,
										dater: 1,
										exported: 1,
										entity: 1,
										total_ttc: 1,
										total_ht: 1,
										total_paid: 1,
										Status: 1,
										ID: 1,
										ref: 1,
										status: 1,
										_type: 1,
										forSales: 1,
										createdAt: 1,
										channel: 1,
										payments: 1,
										removable: {
												$cond: {
														if: {
																$or: [{
																		$eq: ['$workflow.status', 'Done']
																}, {
																		$eq: ['$tempWorkflow.status', 'Done']
																}, {
																		$and: [{
																				$ne: ['$status.fulfillStatus', 'NOR']
																		}, {
																				$ne: ['$status.fulfillStatus', 'NOT']
																		}]
																}]
														},
														then: false,
														else: true
												}
										}
								}
						},
						{
								$match: newQueryObj
						},
						{
								$group: {
										_id: null,
										total: {
												$sum: 1
										},
										total_ht: {
												$sum: "$total_ht"
										},
										total_ttc: {
												$sum: "$total_ttc"
										},
										total_paid: {
												$sum: "$total_paid"
										},
										min: {
												$min: "$total_ht"
										},
										max: {
												$max: "$total_ht"
										},
										avg: {
												$avg: "$total_ht"
										},
										root: {
												$push: '$$ROOT'
										}
								}
						}, {
								$unwind: '$root'
						}, {
								$project: {
										_id: '$root._id',
										salesPerson: '$root.salesPerson',
										workflow: '$root.workflow',
										supplier: '$root.supplier',
										currency: '$root.currency',
										paymentInfo: '$root.paymentInfo',
										datec: '$root.datec',
										ref_client: '$root.ref_client',
										dater: '$root.dater',
										createdAt: '$root.createdAt',
										exported: '$root.exported',
										entity: '$root.entity',
										total_ttc: '$root.total_ttc',
										total_ht: '$root.total_ht',
										total_paid: '$root.total_paid',
										Status: '$root.Status',
										ID: '$root.ID',
										ref: '$root.ref',
										status: '$root.status',
										removable: '$root.removable',
										channel: '$root.channel',
										payments: '$root.payments',
										total: 1,
										totalAll: {
												count: "$total",
												total_ht: "$total_ht",
												total_ttc: "$total_ttc",
												total_paid: "$total_paid",
												min: "$min",
												max: "$max",
												avg: "$avg"
										}
								}
						}, {
								$unwind: {
										path: '$payments',
										preserveNullAndEmptyArrays: true
								}
						}, {
								$project: {
										salesPerson: 1,
										workflow: 1,
										supplier: 1,
										currency: 1,
										paymentInfo: 1,
										datec: 1,
										ref_client: 1,
										dater: 1,
										exported: 1,
										entity: 1,
										total_ttc: 1,
										total_ht: 1,
										total_paid: 1,
										Status: 1,
										ID: 1,
										ref: 1,
										status: 1,
										removable: 1,
										channel: 1,
										createdAt: 1,
										total: 1,
										totalAll: 1,
										'payments.currency': 1,
										'payments.paidAmount': {
												$cond: [{
														$eq: ['$payments.refund', true]
												}, {
														$multiply: ['$payments.paidAmount', -1]
												}, '$payments.paidAmount']
										}
								}
						}, {
								$group: {
										_id: '$_id',
										salesPerson: {
												$first: '$salesPerson'
										},
										workflow: {
												$first: '$workflow'
										},
										supplier: {
												$first: '$supplier'
										},
										currency: {
												$first: '$currency'
										},
										paymentInfo: {
												$first: '$paymentInfo'
										},
										datec: {
												$first: '$datec'
										},
										ref_client: {
												$first: '$ref_client'
										},
										dater: {
												$first: '$dater'
										},
										createdAt: {
												$first: '$createdAt'
										},
										exported: {
												$first: '$exported'
										},
										entity: {
												$first: '$entity'
										},
										total_ttc: {
												$first: '$total_ttc'
										},
										total_ht: {
												$first: '$total_ht'
										},
										total_paid: {
												$first: '$total_paid'
										},
										ID: {
												$first: '$ID'
										},
										Status: {
												$first: '$Status'
										},
										ref: {
												$first: '$ref'
										},
										status: {
												$first: '$status'
										},
										removable: {
												$first: '$removable'
										},
										channel: {
												$first: '$channel'
										},
										paymentsPaid: {
												$sum: {
														$divide: ['$payments.paidAmount', '$payments.currency.rate']
												}
										},
										total: {
												$first: '$total'
										},
										totalAll: {
												$first: '$totalAll'
										}
								}
						}, {
								$project: {
										salesPerson: 1,
										workflow: 1,
										supplier: 1,
										currency: 1,
										paymentInfo: 1,
										datec: 1,
										ref_client: 1,
										dater: 1,
										createdAt: 1,
										exported: 1,
										entity: 1,
										total_ttc: 1,
										total_ht: 1,
										total_paid: 1,
										total_to_paid: {
												$subtract: ["$total_ttc", "$total_paid"]
										},
										Status: {
												$cond: {
														if: {
																$and: [{
																		$eq: ['$Status', 'NOT_PAID']
																}, {
																		$gte: ['$dater', late]
																}]
														},
														then: "VALIDATED",
														else: "$Status"
												}
										},
										ref: 1,
										ID: 1,
										status: 1,
										removable: 1,
										channel: 1,
										paymentsPaid: 1,
										paymentBalance: {
												$subtract: ['$paymentInfo.total', '$paymentsPaid']
										},
										total: 1,
										totalAll: 1
								}
						},
						{
								$sort: sort
						}
				];


				if (skip)
						query.push({
								$skip: skip
						});

				if (limit)
						query.push({
								$limit: limit
						});

				if (options.exec == false) // No execute aggregate : juste return query
						return cb(null, query);

				self.aggregate(query, cb);
		};

		waterfallTasks = [accessRollSearcher, contentSearcher];
		async.waterfall(waterfallTasks, callback);
};

billSchema.statics.getById = function(id, callback) {
		var self = this;
		var ObjectId = MODULE('utils').ObjectId;

		//TODO Check ACL here
		var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
		var query = {};

		if (checkForHexRegExp.test(id))
				query = {
						_id: id
				};
		else
				query = {
						ref: id
				};

		//console.log(query);

		async.waterfall([
						function(wCb) {
								self.findOne(query, "-latex")
										.populate("contacts", "name phone email")
										.populate({
												path: "supplier",
												select: "name salesPurchases",
												populate: {
														path: "salesPurchases.priceList"
												}
										})
										.populate({
												path: "lines.product",
												select: "taxes info weight units",
												//populate: { path: "taxes.taxeId" }
										})
										.populate({
												path: "lines.total_taxes.taxeId"
										})
										.populate({
												path: "total_taxes.taxeId"
										})
										.populate("createdBy", "username")
										.populate("editedBy", "username")
										.populate("offer", "ref total_ht forSales")
										.populate("order", "ref total_ht forSales")
										.populate("orders", "ref total_ht forSales")
										.populate('invoiceControl')
										.populate('project', '_id name')
										.populate('shippingMethod', '_id name')
										.populate('workflow', '_id name status')
										.exec(wCb);
						}
				],
				function(err, invoice) {
						if (err)
								return callback(err);

						return callback(err, invoice);
				});
};

billSchema.statics.setInvoiceNumber = function(invoice, callback) {
		var SeqModel = MODEL('Sequence').Schema;
		var EntityModel = MODEL('entity').Schema;

		if (!invoice || invoice.Status == 'DRAFT' || invoice.total_ttc === 0) {
				invoice.Status = 'DRAFT';
				return callback(null, invoice);
		}

		if (invoice.ref.substr(0, 4) !== "PROV")
				return callback(null, invoice);

		if (invoice.forSales == true)
				return SeqModel.inc("INVOICE", function(seq, number) {
						//console.log(seq);
						invoice.ID = number;
						EntityModel.findOne({
								_id: invoice.entity
						}, "cptRef", function(err, entity) {
								if (err)
										console.log(err);

								if (entity && entity.cptRef)
										invoice.ref = (invoice.total_ttc < 0 ? "AV" : "FA") + entity.cptRef + seq;
								else
										invoice.ref = (invoice.total_ttc < 0 ? "AV" : "FA") + seq;

								callback(null, invoice);
						});
				});
};

/**
 * Pre-save hook
 */
billSchema.pre('save', function(next) {

		var self = this;
		var SeqModel = MODEL('Sequence').Schema;
		var EntityModel = MODEL('entity').Schema;

		this.dater = MODULE('utils').calculate_date_lim_reglement(this.datec, this.cond_reglement_code);

		if (this.isNew)
				this.history = [];

		if (self.total_ttc === 0)
				self.Status = 'DRAFT';

		if (!self.ref && self.isNew) {
				if (self.forSales == true)
						return SeqModel.inc("PROV", function(seq, number) {
								//console.log(seq);
								self.ID = number;
								self.ref = "PROV" + seq;
								next();
						});
				//supplier invoice
				return SeqModel.inc("SUPPLIER_INVOICE", function(seq, number) {
						//console.log(seq);
						self.ID = number;
						EntityModel.findOne({
								_id: self.entity
						}, "cptRef", function(err, entity) {
								if (err)
										console.log(err);

								/*if (entity && entity.cptRef)
								    invoice.ref = "FF" + entity.cptRef + seq;
								else*/
								self.ref = "FF" + seq;
								next();
						});
				});
		}


		self.ref = F.functions.refreshSeq(self.ref, self.datec);
		next();
});

/*var statusList = {};
Dict.dict({ dictName: 'fk_bill_status', object: true }, function(err, doc) {
    if (err) {
        console.log(err);
        return;
    }
    statusList = doc;
});*/

exports.Status = {
		"_id": "fk_bill_status",
		"lang": "orders",
		"values": {
				"DRAFT": {
						"enable": true,
						"label": "BillStatusDraft",
						"cssClass": "ribbon-color-default label-default",
						"system": true
				},
				"VALIDATED": {
						"enable": true,
						"label": "BillStatusValidated",
						"cssClass": "ribbon-color-success label-success"
				},
				"NOT_PAID": {
						"enable": true,
						"label": "BillStatusNotPaid",
						"cssClass": "ribbon-color-danger label-danger",
						"system": true
				},
				"PAID": {
						"enable": true,
						"label": "BillShortStatusPaid",
						"cssClass": "ribbon-color-success label-success",
						"system": true
				},
				"STARTED": {
						"enable": true,
						"label": "BillStatusStarted",
						"cssClass": "ribbon-color-warning label-warning",
						"system": true
				},
				"PAID_PARTIALLY": {
						"enable": true,
						"label": "BillStatusClosedPaidPartially",
						"cssClass": "ribbon-color-info label-info",
						"system": true
				},
				"CANCELED": {
						"enable": true,
						"label": "BillStatusCanceled",
						"cssClass": "ribbon-color-warning label-warning",
						"system": true
				},
				"CONVERTED_TO_REDUC": {
						"enable": true,
						"label": "BillStatusConvertedToReduc",
						"cssClass": "ribbon-color-success label-success",
						"system": true
				},
				"PAID_BACK": {
						"enable": true,
						"label": "BillShortStatusPaid",
						"cssClass": "ribbon-color-success label-success",
						"system": true
				}
		}
};

billSchema.virtual('_status')
		.get(function() {
				var status = this.Status;

				if (status === 'NOT_PAID' && this.dater > moment().subtract(10, 'days').toDate()) //Check if late
						status = 'VALIDATED';

				return MODULE('utils').Status(status, exports.Status);
		});

/*var transactionList = [];

 TransactionModel.aggregate([
 {$group: {
 _id: '$bill.id',
 sum: {$sum: '$credit'}
 }}
 ], function (err, doc) {
 if (err)
 return console.log(err);

 transactionList = doc;
 });*/

billSchema.virtual('amount').get(function() {

		var amount = {};
		var id = this._id;



		/*if (transactionList) {
		 for (var i = 0; i < transactionList.length; i++) {
		 if (id.equals(transactionList[i]._id)) {
		 amount.rest = this.total_ttc - transactionList[i].sum;
		 amount.set = transactionList[i].sum;
		 return amount;
		 }
		 }
		 }*/

		return this.total_ttc - this.total_paid;
});

exports.Schema = mongoose.model('invoice', billSchema, 'Invoices');
exports.name = 'invoice';

F.on('invoice:recalculateStatus', function(data) {
		var userId = data.userId;
		const BillModel = MODEL('invoice').Schema;
		const TransactionModel = MODEL('transaction').Schema;
		const ObjectId = MODULE('utils').ObjectId;

		//console.log(data);
		console.log("Update emit invoice", data);

		if (!data.invoice || !data.invoice._id)
				return;

		BillModel.findById(data.invoice._id, "_id Status isremoved total_ttc", function(err, bill) {
				if (err)
						return console.log(err);

				if (!bill)
						return console.log("No bill found");

				if (bill.isremoved)
						return BillModel.update({
								_id: bill._id
						}, {
								$set: {
										updatedAt: new Date(),
										total_ttc: 0,
										total_paid: 0,
										total_ht: 0
								}
						}, function(err, doc) {
								if (err)
										return console.log(err);
						});

				if (bill.Status == "DRAFT")
						return;

				TransactionModel.aggregate([{
								$match: {
										"meta.bills.invoice": ObjectId(data.invoice._id),
										voided: false,
										$or: [{
												"meta.bank": {
														$ne: null
												}
										}, {
												"meta.isWaiting": true
										}],
								}
						}, {
								$unwind: {
										path: '$meta.bills'
								}
						}, {
								$match: {
										"meta.bills.invoice": ObjectId(data.invoice._id)
								}
						}, {
								$group: {
										_id: null,
										amount: {
												$sum: "$meta.bills.amount"
										}
								}
						}],
						function(err, doc) {
								if (err)
										return console.log(err);

								//console.log(doc);

								if (!doc || doc.length == 0)
										return BillModel.update({
												_id: bill._id
										}, {
												$set: {
														Status: "NOT_PAID",
														updatedAt: new Date(),
														total_paid: 0
												}
										}, function(err, doc) {
												if (err)
														return console.log(err);
										});

								let payment = doc[0].amount;
								//console.log(payment);

								var status = "STARTED";
								if (round(payment, 2) >= round(bill.total_ttc, 2))
										status = "PAID";

								if (round(payment, 2) == 0)
										status = "NOT_PAID";

								BillModel.update({
										_id: bill._id
								}, {
										$set: {
												Status: status,
												updatedAt: new Date(),
												total_paid: payment
										}
								}, function(err, doc) {
										if (err)
												return console.log(err);
										//console.log(doc);
								});
						});
		});
});
