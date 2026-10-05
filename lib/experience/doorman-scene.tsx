import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { OutcomeBlock, StoryStage } from "@/design-system/demo/decision-lab";
import type { ExperienceInput, ExperienceResult } from "./adapter";
export function DoormanScene({frame,input,result,locale}:{frame:PlaybackFrame<TraceEvent>;input:ExperienceInput;result:ExperienceResult;locale:"en"|"es"}) {
  const es=locale==="es";
  const classified=result.inputVerdict.firedRules.length>0;
  const blocked=frame.complete && result.blockedBy.length>0;
  const signal=frame.complete ? blocked : frame.visible>=2 && classified;
  const status=frame.complete ? (blocked ? (es?"BLOQUEO":"BLOCK") : result.executed.length ? (es?"PERMISO":"PERMIT") : (es?"NINGUNA":"NONE")) : frame.visible>=2 ? (classified ? (es?"REGLAS":"RULES") : (es?"LIBRE":"CLEAR")) : (es?"ESPERA":"WAIT");
  return <StoryStage locale={locale} title={es?"Cuarentena de documento":"Document quarantine"} caption={es?"La clasificación del paso 2 y la autorización del paso 3 son decisiones diferentes.":"Step 2 classification and step 3 authorization are separate decisions."} step={frame.visible} total={frame.total}>
    <svg role="img" aria-label={es?"Documento pasando por política":"Document passing through policy"} viewBox="0 0 420 180" className="h-56 w-full">
      <rect x="25" y="52" width="115" height="78" rx="10" className="fill-muted stroke-border"/>
      <text x="45" y="87" className="fill-foreground text-[12px]">{es?"documento":"document"}</text>
      <text x="45" y="106" className="fill-foreground text-[10px]">{input.hardened?(es?"política activa":"policy on"):(es?"sin política":"policy off")}</text>
      <path d="M145 90H260" className="stroke-accent" strokeWidth="4" strokeDasharray="8 6"/>
      <rect x="260" y="40" width="78" height="100" rx="12" className={frame.visible<2?"fill-muted stroke-border":signal?"fill-danger/20 stroke-danger":"fill-info/20 stroke-info"}/>
      <text x="269" y="88" className="fill-foreground text-[11px]">{status}</text>
      <path d="M338 90H395" className={!frame.complete?"stroke-border":blocked?"stroke-danger":"stroke-info"} strokeWidth="5"/>
    </svg>
    {frame.visible>=2&&<p className="mb-5 text-sm">{es?"Reglas activadas":"Triggered rules"}: {result.inputVerdict.firedRules.length}. {es?"No detectar una regla no autoriza herramientas.":"No rule detected does not authorize tools."}</p>}
    {frame.complete&&<OutcomeBlock tone={blocked?"warning":"info"} title={blocked?(es?"Política bloquea el documento":"Policy blocks the document"):result.executed.length?(es?"Acción autorizada en la simulación":"Action permitted in simulation"):(es?"Sin acción solicitada":"No requested action")} explanation={es?`${result.blockedBy.length} bloqueos de política; no hubo acción externa.`:`${result.blockedBy.length} policy blocks; no external action occurred.`}/>}
  </StoryStage>;
}
