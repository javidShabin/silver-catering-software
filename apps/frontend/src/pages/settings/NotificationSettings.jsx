import { useState } from "react";
import SettingsModule, { ModuleRow } from "../../components/ui/SettingsModule";
import Switch from "../../components/ui/Switch";
import FloatingSaveBar from "../../components/ui/FloatingSaveBar";
import { Bell, Mail, Smartphone, AlertTriangle } from "lucide-react";

const NotificationSettings = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDirty(false);
    }, 1500);
  };

  const handleReset = () => setIsDirty(false);
  const handleChange = () => setIsDirty(true);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        
        {/* Communication Channels */}
        <SettingsModule 
          span="md:col-span-4" 
          title="Communication Channels" 
          description="Manage how we send notifications to you."
          icon={Bell}
        >
          <div className="space-y-1 mt-2">
            <ModuleRow label="Email Notifications" description="Receive updates directly to your inbox.">
              <Switch checked={emailAlerts} onChange={(val) => { setEmailAlerts(val); handleChange(); }} />
            </ModuleRow>
            <ModuleRow label="Push Notifications" description="Real-time alerts sent to your device.">
              <Switch checked={pushNotifications} onChange={(val) => { setPushNotifications(val); handleChange(); }} />
            </ModuleRow>
          </div>
        </SettingsModule>

        {/* Alert Preferences */}
        <SettingsModule 
          span="md:col-span-2" 
          title="Alert Preferences"
          icon={AlertTriangle}
        >
          <div className="space-y-1 mt-2">
            <ModuleRow label="Critical Security Alerts" description="Mandatory account alerts">
              <Switch checked={criticalAlerts} disabled />
            </ModuleRow>
            <ModuleRow label="Marketing Emails" description="Promotions and news">
              <Switch checked={marketingEmails} onChange={(val) => { setMarketingEmails(val); handleChange(); }} />
            </ModuleRow>
          </div>
        </SettingsModule>

      </div>

      <FloatingSaveBar 
        show={isDirty} 
        onSave={handleSave} 
        onReset={handleReset}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NotificationSettings;
