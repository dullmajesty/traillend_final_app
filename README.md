TrailLend Mobile App — How It Started

After completing the web-based administrative system, the team began developing the TrailLend Mobile App to make barangay lending more accessible and convenient for residents.
While the web version focuses on management and monitoring, the mobile app was designed primarily for borrowers — providing a smooth way to reserve, track, and return items anytime, anywhere.

The mobile application was built using React Native and Expo, allowing it to run seamlessly on both Android and iOS devices.
It connects directly to the Django REST API from the web system, ensuring real-time data synchronization for all modules.

Through the app, users can:

View the list of available barangay equipment such as tents, chairs, and sound systems.
Submit reservation requests by selecting an item, quantity, and desired borrowing date.
Receive instant notifications when their reservation is approved, declined, or due for return.
Scan or present their QR code for verification using the ESP32-CAM module at the barangay office.
Report damaged or missing items with attached images for faster action.
The app also features a responsive and user-friendly interface that matches the clean, professional style of the web dashboard — making it intuitive even for first-time users.
The TrailLend mobile app is a major step toward digitizing barangay services, ensuring transparency, accountability, and efficiency for both barangay officials and residents.

System Integration — How Web, Mobile, and IoT Work Together

The TrailLend ecosystem is built on seamless communication between three main components:
The Django Web System (Admin Dashboard)
The React Native Mobile App (Borrower Interface)
The ESP32-CAM IoT Module (QR Code Verification Device)

Each part plays a specific role, forming a connected system that ensures every borrowing transaction is tracked and verified accurately.

1. Django Web System (Backend & Admin Control)

• Serves as the central database and API provider for both mobile and IoT components.
• Built using Django REST Framework (DRF) to handle API requests securely.
• Manages user authentication, inventory data, reservations, and QR code generation.
• Admins can oversee all reservations, update statuses, and monitor activity through the dashboard.

2. React Native Mobile App (User Side)

• Acts as the frontline interface for barangay residents.
• Communicates directly with the Django API to fetch live data on item availability and status.

Enables users to:

•Submit reservation requests
•Receive push notifications for approvals or declines
•Display generated QR codes for verification
•Automatically syncs changes with the Django backend in real time.

3. ESP32-CAM (Verification Device)

• Used by barangay staff to scan QR codes during item borrowing and return.
• Upon scanning, it connects to the Django API and validates the QR code data.
• If verified, the system automatically updates the reservation status (e.g., Borrowed or Returned).
• This ensures contactless, secure, and fast verification while minimizing manual entry errors.

System Workflow

• Borrower (Mobile App) → Submits a reservation.
• Admin (Web System) → Reviews and approves the request; system generates a QR code.
• Borrower (Mobile App) → Receives notification and QR code.
• Barangay Staff (ESP32-CAM) → Scans the QR code for verification.
• Django Backend → Confirms validity and updates item status.
• Dashboard and Mobile App → Reflect real-time updates across both platforms.

Integration Highlights

• All components share a single database powered by Django.
• Communication is handled via RESTful API endpoints.
• JWT authentication ensures data security between mobile, web, and IoT devices.
• The architecture allows future scalability — such as adding new barangay branches or cloud deployment.
