export const getCateringDesignation = (member) => {
  if (!member) return "Catering Staff";
  
  const dept = (member.department || "").toLowerCase();
  const systemRole = (member.role || "").toLowerCase();
  
  if (dept === "culinary" || systemRole === "kitchen-staff" || dept.includes("cook") || dept.includes("chef")) {
    return "Cook / Chef";
  }
  if (dept === "service" || dept.includes("captain") || dept.includes("lead")) {
    return "Event Captain";
  }
  if (dept === "logistics" || systemRole === "delivery-staff" || dept.includes("boy") || dept.includes("catering")) {
    return "Catering Boy";
  }
  
  // Capitalize department as catering role if custom
  if (member.department && member.department.toLowerCase() !== "general") {
    return member.department.charAt(0).toUpperCase() + member.department.slice(1);
  }
  
  return "Catering Staff";
};
