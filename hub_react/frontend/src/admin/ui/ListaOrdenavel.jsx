import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

function Item({ id, desabilitado, children }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: desabilitado,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 bg-white px-2 py-3 sm:gap-3 sm:px-4 ${
        isDragging ? 'relative z-10 rounded-lg shadow-lg ring-1 ring-brand/40' : ''
      }`}
    >
      {!desabilitado && (
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label="Arrastar para reordenar"
          className="cursor-grab touch-none rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
      )}
      {children}
    </li>
  );
}

/**
 * Lista vertical reordenável por arrastar (mouse, toque ou teclado: Tab até a
 * alça, Espaço, setas, Espaço). Chama `aoReordenar(novaLista)`.
 */
export default function ListaOrdenavel({ itens, aoReordenar, renderItem, desabilitado = false }) {
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function aoSoltar({ active, over }) {
    if (!over || active.id === over.id) return;
    const de = itens.findIndex((i) => i.id === active.id);
    const para = itens.findIndex((i) => i.id === over.id);
    aoReordenar(arrayMove(itens, de, para));
  }

  return (
    <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={aoSoltar}>
      <SortableContext items={itens.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-gray-100">
          {itens.map((item) => (
            <Item key={item.id} id={item.id} desabilitado={desabilitado}>
              {renderItem(item)}
            </Item>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
