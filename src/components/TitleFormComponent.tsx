import * as LucideReact from "lucide-react";

interface Props {
  title: string;
  mode?: "create" | "edit";
  className?: string;
  icon?: keyof typeof LucideReact;
}

export default function TitleFormComponent({
  title,
  mode,
  className = "",
  icon,
}: Props) {
  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {IconComponent && (
        <div className="text-white bg-primary rounded-md p-2">
          <IconComponent className="size-5 text-white" />
        </div>
      )}
      <div className="flex flex-col items-start">
        <h1 className="md:text-xl font-bold text-primary">{title}</h1>

        <p className="text-muted-foreground text-xs md:text-sm">{`${
          mode === "create" ? "Agregar" : "Actualizar"
        } ${title}`}</p>
      </div>
    </div>
  );
}
