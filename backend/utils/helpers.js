const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320,
};

function computeDerivedFields(ticket) {
  const ticketObj = ticket.toObject ? ticket.toObject() : { ...ticket };

  let ageMinutes;
  if (ticketObj.status === "resolved" || ticketObj.status === "closed") {
    ageMinutes = ticketObj.resolvedAt
      ? Math.floor(
          (new Date(ticketObj.resolvedAt) - new Date(ticketObj.createdAt)) /
            60000,
        )
      : Math.floor((Date.now() - new Date(ticketObj.createdAt)) / 60000);
  } else {
    ageMinutes = Math.floor(
      (Date.now() - new Date(ticketObj.createdAt)) / 60000,
    );
  }

  const slaTarget = SLA_TARGETS[ticketObj.priority];
  let slaBreached;
  if (ticketObj.status === "resolved" || ticketObj.status === "closed") {
    slaBreached = ageMinutes > slaTarget;
  } else {
    slaBreached =
      (Date.now() - new Date(ticketObj.createdAt)) / 60000 > slaTarget;
  }

  ticketObj.ageMinutes = ageMinutes;
  ticketObj.slaBreached = slaBreached;

  return ticketObj;
}

function isSlaBreached(ticket) {
  const slaTarget = SLA_TARGETS[ticket.priority];
  let ageMinutes;
  if (ticket.status === "resolved" || ticket.status === "closed") {
    ageMinutes = ticket.resolvedAt
      ? Math.floor(
          (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / 60000,
        )
      : Math.floor((Date.now() - new Date(ticket.createdAt)) / 60000);
  } else {
    ageMinutes = Math.floor((Date.now() - new Date(ticket.createdAt)) / 60000);
  }
  return ageMinutes > slaTarget;
}

module.exports = { computeDerivedFields, isSlaBreached, SLA_TARGETS };
