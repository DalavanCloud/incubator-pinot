import { isPresent } from '@ember/utils';
import moment from 'moment';
import _ from 'lodash';
import {
  checkStatus,
  postProps,
  postYamlProps
} from 'thirdeye-frontend/utils/utils';
import fetch from 'fetch';
import {
  anomalyApiUrls,
  getAnomaliesForYamlPreviewUrl,
  getAnomaliesByAlertIdUrl
} from 'thirdeye-frontend/utils/api/anomaly';

/**
 * Response type options for anomalies.
 * TODO: This needs to be a configuration somewhere for the user to save. It is hard coded here but this is not a good idea
 to hard code it for feedback mapping.
 */
export const anomalyResponseObj = [
  { name: 'Not reviewed yet',
    value: 'NO_FEEDBACK',
    status: 'Not Resolved'
  },
  { name: 'Yes - unexpected',
    value: 'ANOMALY',
    status: 'Confirmed Anomaly'
  },
  { name: 'Expected temporary change',
    value: 'ANOMALY_EXPECTED',
    status: 'Expected Anomaly'
  },
  { name: 'Expected permanent change',
    value: 'ANOMALY_NEW_TREND',
    status: 'Confirmed - New Trend'
  },
  { name: 'No change observed',
    value: 'NOT_ANOMALY',
    status: 'False Alarm'
  }
];

export const anomalyResponseObjNew = [
  { name: 'Not reviewed yet',
    value: 'NONE',
    status: 'Not Resolved'
  },
  { name: 'Yes - unexpected',
    value: 'ANOMALY',
    status: 'Confirmed Anomaly'
  },
  { name: 'Expected temporary change',
    value: 'ANOMALY_EXPECTED',
    status: 'Expected Anomaly'
  },
  { name: 'Expected permanent change',
    value: 'ANOMALY_NEW_TREND',
    status: 'Confirmed - New Trend'
  },
  { name: 'No change observed',
    value: 'NOT_ANOMALY',
    status: 'False Alarm'
  }
];

/**
 * Mapping for anomalyResponseObj 'status' to 'name' for easy lookup
 */
export let anomalyResponseMap = {};
anomalyResponseObj.forEach((obj) => {
  anomalyResponseMap[obj.status] = obj.name;
});

/**
 * Mapping for anomalyResponseObjNew 'value' to 'name' for easy lookup
 */
export let anomalyResponseMapNew = {};
anomalyResponseObjNew.forEach((obj) => {
  anomalyResponseMapNew[obj.value] = obj.name;
});


/**
 * Update feedback status on any anomaly
 * @method updateAnomalyFeedback
 * @param {Number} anomalyId - the id of the anomaly to update
 * @param {String} feedbackType - key for feedback type
 * @return {Ember.RSVP.Promise}
 */
export function updateAnomalyFeedback(anomalyId, feedbackType) {
  const url = `/anomalies/updateFeedback/${anomalyId}`;
  const data = { feedbackType, comment: '' };
  return fetch(url, postProps(data)).then((res) => checkStatus(res, 'post'));
}

/**
 * Post Yaml to preview anomalies detected with given configuration
 * @method getYamlPreviewAnomalies
 * @param {String} yamlString - the alert configuration in Yaml
 * @param {Number} startTime - start time of analysis range
 * @param {Number} endTime - end time of analysis range
 * @return {Ember.RSVP.Promise}
 */
export function getYamlPreviewAnomalies(yamlString, startTime, endTime) {
  const url = getAnomaliesForYamlPreviewUrl(startTime, endTime);
  return fetch(url, postYamlProps(yamlString)).then((res) => checkStatus(res, 'post', false, true));
}

/**
 * Get anomalies for a given detection id over a specified time range
 * @method getAnomaliesByAlertId
 * @param {Number} alertId - the alert id aka detection config id
 * @param {Number} startTime - start time of analysis range
 * @param {Number} endTime - end time of analysis range
 * @return {Ember.RSVP.Promise}
 */
export function getAnomaliesByAlertId(alertId, startTime, endTime) {
  const url = getAnomaliesByAlertIdUrl(alertId, startTime, endTime);
  return fetch(url).then(checkStatus);
}

/**
 * Fetch a single anomaly record for verification
 * @method verifyAnomalyFeedback
 * @param {Number} anomalyId
 * @return {Ember.RSVP.Promise}
 */
export function verifyAnomalyFeedback(anomalyId) {
  const url = `${anomalyApiUrls.getAnomalyDataUrl()}${anomalyId}`;
  return fetch(url).then(checkStatus);
}

/**
 * Formats anomaly duration property for display on the table
 * @param {Number} anomalyStart - the anomaly start time
 * @param {Number} anomalyEnd - the anomaly end time
 * @returns {String} the fomatted duration time
 * @example getFormatDuration(1491804013000, 1491890413000) // yields => 'Apr 9, 11:00 PM'
 */
export function getFormattedDuration(anomalyStart, anomalyEnd) {
  const startMoment = moment(anomalyStart);
  const endMoment = moment(anomalyEnd);
  const anomalyDuration = moment.duration(endMoment.diff(startMoment));
  const days = anomalyDuration.get('days');
  const hours = anomalyDuration.get('hours');
  const minutes = anomalyDuration.get('minutes');
  const duration = [pluralizeTime(days, 'day'), pluralizeTime(hours, 'hour'), pluralizeTime(minutes, 'minute')];
  // We want to display only non-zero duration values in our table
  const noZeroDurationArr = _.remove(duration, function(item) {
    return isPresent(item);
  });
  return noZeroDurationArr.join(', ');
}

/**
 * Pluralizes and formats the anomaly range duration string
 * @param {Number} time
 * @param {String} unit
 * @returns {String}
 * @example pluralizeTime(days, 'day')
 */
export function pluralizeTime(time, unit) {
  const unitStr = time > 1 ? unit + 's' : unit;
  return time ? time + ' ' + unitStr : '';
}

export default {
  anomalyResponseObj,
  anomalyResponseMap,
  anomalyResponseObjNew,
  anomalyResponseMapNew,
  updateAnomalyFeedback,
  getFormattedDuration,
  verifyAnomalyFeedback,
  pluralizeTime,
  getYamlPreviewAnomalies,
  getAnomaliesByAlertId
};
