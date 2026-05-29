from tests.conftest import (
    create_org_and_admin, create_driver,
    create_customer, create_vehicle, create_delivery
)

class TestTracking:

    def _setup_active_delivery(self, client, suffix):
        """Helper: create and assign delivery, return all needed objects"""
        token = create_org_and_admin(client, suffix)
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, driver_headers = create_driver(
            client, admin_headers, suffix
        )
        _, customer_headers = create_customer(
            client, admin_headers, suffix
        )
        vehicle = create_vehicle(
            client, admin_headers, f"TRK{suffix}"
        )
        delivery = create_delivery(client, customer_headers)

        # Assign
        client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": driver_user["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 500
            },
            headers=admin_headers
        )

        # Pick up
        client.put(
            f"/deliveries/{delivery['id']}/status",
            json={"status": "picked_up"},
            headers=driver_headers
        )

        return delivery, driver_headers, customer_headers, admin_headers

    def test_driver_can_update_location(self, client):
        delivery, driver_headers, _, _ = self._setup_active_delivery(
            client, "trk1"
        )
        response = client.post(
            f"/deliveries/{delivery['id']}/tracking",
            json={
                "latitude": 13.0827,
                "longitude": 80.2707,
                "address_snapshot": "Test Area, Chennai"
            },
            headers=driver_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["latitude"] == 13.0827
        print("✅ Driver can send location updates")

    def test_tracking_history_stored(self, client):
        delivery, driver_headers, customer_headers, _ = (
            self._setup_active_delivery(client, "trk2")
        )

        # Send 3 updates
        for i in range(3):
            client.post(
                f"/deliveries/{delivery['id']}/tracking",
                json={
                    "latitude": 13.08 + i * 0.01,
                    "longitude": 80.27 + i * 0.01,
                    "address_snapshot": f"Location {i+1}"
                },
                headers=driver_headers
            )

        response = client.get(
            f"/deliveries/{delivery['id']}/tracking",
            headers=customer_headers
        )
        assert response.status_code == 200
        assert len(response.json()) == 3
        print("✅ All location updates stored in history")

    def test_wrong_driver_cannot_update_location(self, client):
        token = create_org_and_admin(client, "trk3")
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, driver_headers = create_driver(
            client, admin_headers, "trk3a"
        )
        other_driver, _ = create_driver(
            client, admin_headers, "trk3b"
        )
        _, customer_headers = create_customer(
            client, admin_headers, "trk3"
        )
        vehicle = create_vehicle(client, admin_headers, "TRK3")
        delivery = create_delivery(client, customer_headers)

        # Assign to other driver
        client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": other_driver["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 500
            },
            headers=admin_headers
        )

        response = client.post(
            f"/deliveries/{delivery['id']}/tracking",
            json={"latitude": 13.08, "longitude": 80.27},
            headers=driver_headers
        )
        assert response.status_code == 403
        print("✅ Wrong driver blocked from location update")