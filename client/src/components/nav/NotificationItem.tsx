type NotificationItemProps = {
  notification: {
    certificate_id: number;
    certificate_name: string;
    days_left: number;
    expiration_date: string;
  };
};

const NotificationItem = ({ notification }: NotificationItemProps) => {
  return (
    <li className="list-row pt-2 pb-4 pl-3 mt-1 mb-1">
      <div>
        <div className="flex items-center gap-3">
          {notification.days_left <= 1 && (
            <div className="inline-grid *:[grid-area:1/1]">
              <div className="status status-error animate-ping"></div>
              <div className="status status-error"></div>
            </div>
          )}
          {notification.days_left > 5 && (
            <div
              aria-label="status"
              className="status status-primary status-md"
            />
          )}
          <p className="font-bold">{notification.certificate_name}</p>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {notification.days_left === 0 && (
            <p>Su certificado expira el dia de hoy.</p>
          )}
          {notification.days_left === 1 && (
            <p>Tiene hasta el dia de mañana para renovar su certificado.</p>
          )}
          {notification.days_left > 1 && (
            <p>
              Tiene {notification.days_left} dias restantes para renovar su
              certificado.
            </p>
          )}
        </div>
      </div>
    </li>
  );
};

export default NotificationItem;
