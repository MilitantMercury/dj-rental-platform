import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/area-riservata/impostazioni/actions", () => ({ saveOwnerSettings: vi.fn(), saveCommunicationSettings:vi.fn(),saveLogisticsSettings:vi.fn(),saveIdentitySettings:vi.fn() }));
import { OwnerSettingsPanel } from "@/components/owner-settings-panel";
describe("impostazioni owner", () => {
  it("mostra solo controlli e destinazioni operative", () => {
    render(<OwnerSettingsPanel settings={{option_duration_hours:48,operational_margin_days:2,sender_name:"ND",sender_email:"",owner_notification_email:"",notify_new_requests:true,notify_quote_responses:true,notify_operational_updates:true,pickup_enabled:true,delivery_enabled:true,pickup_address:"",pickup_address_street:"Via Roma",pickup_address_number:"10",pickup_address_postal_code:"20100",pickup_address_city:"Milano",pickup_address_province:"MI",pickup_address_country:"Italia",pickup_instructions:"",public_name:"Noleggio DJ",public_email:"",public_phone:"",whatsapp_url:"",instagram_url:"",facebook_url:"",site_intro:""}} />);
    expect(screen.getByLabelText(/L’opzione scade dopo/)).toHaveValue(48);
    expect(screen.getByLabelText(/Lascia liberi prima e dopo/)).toHaveValue(2);
    expect(screen.getByText(/materiale rimane impegnato/)).toBeInTheDocument();
    expect(screen.getByLabelText("Via / piazza")).toHaveValue("Via Roma");
    expect(screen.getByLabelText("Numero civico")).toHaveValue("10");
    expect(screen.getByLabelText("CAP")).toHaveValue("20100");
    expect(screen.getByLabelText("Comune")).toHaveValue("Milano");
    expect(screen.getByLabelText("Provincia")).toHaveValue("MI");
    expect(screen.getByLabelText("Paese: Italia")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tipi di evento/ })).toHaveAttribute("href", "/area-riservata/configurazione/eventi");
    expect(screen.getByRole("link", { name: /Collaboratori/ })).toHaveAttribute("href", "/area-riservata/impostazioni/collaboratori");
    expect(screen.queryByRole("link", { name: /Catalogo|Magazzino/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/In arrivo|Da completare|Configurato/)).not.toBeInTheDocument();
  });
});
