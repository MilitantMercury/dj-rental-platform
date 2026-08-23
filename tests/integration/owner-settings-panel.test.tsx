import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/area-riservata/impostazioni/actions", () => ({ saveOwnerSettings: vi.fn(), saveCommunicationSettings:vi.fn(),saveLogisticsSettings:vi.fn(),saveIdentitySettings:vi.fn() }));
import { OwnerSettingsPanel } from "@/components/owner-settings-panel";
describe("impostazioni owner", () => {
  it("mostra solo controlli e destinazioni operative", () => {
    render(<OwnerSettingsPanel settings={{option_duration_hours:48,operational_margin_days:2,sender_name:"ND",sender_email:"",owner_notification_email:"",notify_new_requests:true,notify_quote_responses:true,notify_operational_updates:true,pickup_enabled:true,delivery_enabled:true,pickup_address:"",pickup_instructions:"",public_name:"Noleggio DJ",public_email:"",public_phone:"",whatsapp_url:"",instagram_url:"",facebook_url:"",site_intro:""}} />);
    expect(screen.getByLabelText(/L’opzione scade dopo/)).toHaveValue(48);
    expect(screen.getByLabelText(/Lascia liberi prima e dopo/)).toHaveValue(2);
    expect(screen.getByText(/materiale rimane impegnato/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tipi di evento/ })).toHaveAttribute("href", "/area-riservata/configurazione/eventi");
    expect(screen.getByRole("link", { name: /Collaboratori/ })).toHaveAttribute("href", "/area-riservata/impostazioni/collaboratori");
    expect(screen.queryByRole("link", { name: /Catalogo|Magazzino/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/In arrivo|Da completare|Configurato/)).not.toBeInTheDocument();
  });
});
